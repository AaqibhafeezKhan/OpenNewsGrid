import { NewsArticle, AggregatedStory, NewsSource, NewsFilters } from '@/types';
import { globalCache, generateCacheKey } from './cache';
import { calculateSimilarity, normalizeString, extractKeywords, estimateReadTime, generateId } from './utils';
import { CATEGORIES, COUNTRIES, NEWS_SOURCES, API_KEYS } from './constants';
import { rssAggregator, ALL_RSS_FEEDS } from './rss-aggregator';
import Parser from 'rss-parser';

// Custom interface extending Parser.Item to include custom RSS fields
interface CustomItem extends Parser.Item {
  'content:encoded'?: string;
  'media:content'?: any;
  'media:thumbnail'?: any;
  enclosure?: any;
  content?: string;
  summary?: string;
  author?: string;
  creator?: string;
  'dc:creator'?: string;
  'dc:date'?: string;
  published?: string;
  updated?: string;
  category?: string;
  categories?: string[];
}

const rssParser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; GlobalNewsBot/1.0)',
  },
  customFields: {
    item: [
      'media:content',
      'media:thumbnail',
      'enclosure',
      'content:encoded',
      'content',
      'summary',
      'author',
      'creator',
      'dc:creator',
      'dc:date',
      'published',
      'updated',
      'category',
      'categories',
    ],
  },
});

// Cache TTL values (in milliseconds)
const CACHE_TTL = {
  breaking: 60 * 1000,        // 1 minute
  top: 5 * 60 * 1000,         // 5 minutes
  general: 15 * 60 * 1000,    // 15 minutes
  search: 10 * 60 * 1000,     // 10 minutes
};

class NewsAggregator {
  private similarityThreshold = 0.6; // For deduplication

  async fetchNewsAPI(filters: NewsFilters, page: number = 1, pageSize: number = 20): Promise<NewsArticle[]> {
    const cacheKey = generateCacheKey('newsapi', { ...filters, page, pageSize });
    const cached = globalCache.get<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    if (API_KEYS.NEWSAPI === 'demo') {
      return this.getMockArticles(filters, pageSize);
    }

    try {
      const params = new URLSearchParams({
        apiKey: API_KEYS.NEWSAPI,
        page: page.toString(),
        pageSize: pageSize.toString(),
        language: filters.language || 'en',
      });

      if (filters.query) params.set('q', filters.query);
      if (filters.category && filters.category !== 'general') params.set('category', filters.category);
      if (filters.country) params.set('country', filters.country);
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);

      const endpoint = filters.query ? 'everything' : 'top-headlines';
      const response = await fetch(
        `https://newsapi.org/v2/${endpoint}?${params.toString()}`,
        { next: { revalidate: 300 } }
      );

      if (!response.ok) throw new Error(`NewsAPI error: ${response.status}`);

      const data = await response.json();
      const articles: NewsArticle[] = data.articles.map((item: Record<string, unknown>, idx: number) => 
        this.transformNewsAPIArticle(item, idx, filters.category || 'general')
      );

      globalCache.set(cacheKey, articles, CACHE_TTL.general);
      return articles;
    } catch (error) {
      console.error('NewsAPI fetch error:', error);
      return this.getMockArticles(filters, pageSize);
    }
  }

  async fetchGNews(filters: NewsFilters, page: number = 1, pageSize: number = 20): Promise<NewsArticle[]> {
    const cacheKey = generateCacheKey('gnews', { ...filters, page, pageSize });
    const cached = globalCache.get<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    if (API_KEYS.GNEWS === 'demo') {
      return [];
    }

    try {
      const params = new URLSearchParams({
        apikey: API_KEYS.GNEWS,
        max: pageSize.toString(),
        page: page.toString(),
        lang: filters.language || 'en',
      });

      if (filters.query) params.set('q', filters.query);
      if (filters.category && filters.category !== 'general') params.set('topic', filters.category);
      if (filters.country) params.set('country', filters.country);

      const endpoint = filters.query ? 'search' : 'top-headlines';
      const response = await fetch(
        `https://gnews.io/api/v4/${endpoint}?${params.toString()}`,
        { next: { revalidate: 300 } }
      );

      if (!response.ok) throw new Error(`GNews error: ${response.status}`);

      const data = await response.json();
      const articles: NewsArticle[] = data.articles.map((item: Record<string, unknown>, idx: number) =>
        this.transformGNewsArticle(item, idx, filters.category || 'general')
      );

      globalCache.set(cacheKey, articles, CACHE_TTL.general);
      return articles;
    } catch (error) {
      console.error('GNews fetch error:', error);
      return [];
    }
  }

  async fetchRSSFeeds(category?: string, limit: number = 100): Promise<NewsArticle[]> {
    // Use the comprehensive RSS aggregator
    return rssAggregator.fetchAllFeeds(category, 5, 50);
  }

  async fetchRSSByRegion(regionId: string, limit: number = 50): Promise<NewsArticle[]> {
    return rssAggregator.fetchByRegion(regionId, limit);
  }

  async fetchRSSByCountry(countryCode: string, limit: number = 30): Promise<NewsArticle[]> {
    const cacheKey = `rss-country:${countryCode}:${limit}`;
    const cached = globalCache.get<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    // Find feeds for this country
    const feeds = ALL_RSS_FEEDS.filter(f => f.source.country === countryCode);
    
    const allArticles: NewsArticle[] = [];
    const results = await Promise.allSettled(
      feeds.slice(0, 15).map(feed => rssAggregator.fetchFeed(feed, 5))
    );

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allArticles.push(...result.value);
      }
    });

    const unique = allArticles
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .filter((article, idx, self) => 
        idx === self.findIndex(a => a.title === article.title)
      )
      .slice(0, limit);

    globalCache.set(cacheKey, unique, CACHE_TTL.general);
    return unique;
  }

  async fetchAllSources(filters: NewsFilters, page: number = 1, pageSize: number = 20): Promise<NewsArticle[]> {
    const [newsAPIArticles, gnewsArticles, rssArticles] = await Promise.allSettled([
      this.fetchNewsAPI(filters, page, Math.ceil(pageSize / 2)),
      this.fetchGNews(filters, page, Math.ceil(pageSize / 3)),
      this.fetchRSSFeeds(filters.category, Math.ceil(pageSize / 4)),
    ]);

    const articles: NewsArticle[] = [];
    
    if (newsAPIArticles.status === 'fulfilled') {
      articles.push(...newsAPIArticles.value);
    }
    if (gnewsArticles.status === 'fulfilled') {
      articles.push(...gnewsArticles.value);
    }
    if (rssArticles.status === 'fulfilled') {
      articles.push(...rssArticles.value);
    }

    return articles
      .filter((article, idx, self) => 
        idx === self.findIndex(a => a.id === article.id)
      )
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, pageSize);
  }

  async getBreakingNews(limit: number = 10): Promise<NewsArticle[]> {
    const cacheKey = `breaking:${limit}`;
    const cached = globalCache.get<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    const articles = await this.fetchAllSources({
      category: 'general',
      sortBy: 'publishedAt',
    }, 1, limit * 2);

    // Prioritize recent articles from major sources
    const breaking = articles
      .filter(a => {
        const hoursAgo = (Date.now() - new Date(a.publishedAt).getTime()) / (1000 * 60 * 60);
        return hoursAgo < 24;
      })
      .slice(0, limit);

    globalCache.set(cacheKey, breaking, CACHE_TTL.breaking);
    return breaking;
  }

  async getTopStories(category?: string, limit: number = 20): Promise<AggregatedStory[]> {
    const cacheKey = generateCacheKey('top-stories', { category, limit });
    const cached = globalCache.get<AggregatedStory[]>(cacheKey);
    if (cached) return cached;

    const articles = await this.fetchAllSources({
      category,
      sortBy: 'publishedAt',
    }, 1, limit * 3);

    const aggregated = this.aggregateStories(articles);
    globalCache.set(cacheKey, aggregated, CACHE_TTL.top);
    return aggregated.slice(0, limit);
  }

  private aggregateStories(articles: NewsArticle[]): AggregatedStory[] {
    const stories: Map<string, AggregatedStory> = new Map();

    articles.forEach(article => {
      // Try to find a matching story
      let matchedStory: AggregatedStory | null = null;

      for (const story of stories.values()) {
        const titleSimilarity = calculateSimilarity(article.title, story.headline);
        const keywordsOverlap = article.keywords?.filter(k => 
          story.keywords.includes(k)
        ).length || 0;

        if (titleSimilarity > this.similarityThreshold || keywordsOverlap >= 2) {
          matchedStory = story;
          break;
        }
      }

      if (matchedStory) {
        // Add article to existing story
        matchedStory.relatedArticles.push(article);
        matchedStory.sources.push(article.source);
        if (!matchedStory.countries.includes(article.country)) {
          matchedStory.countries.push(article.country);
        }
        if (!matchedStory.languages.includes(article.language)) {
          matchedStory.languages.push(article.language);
        }
      } else {
        // Create new story
        const story: AggregatedStory = {
          id: generateId(),
          headline: article.title,
          summary: article.description,
          imageUrl: article.imageUrl,
          sources: [article.source],
          primaryArticle: article,
          relatedArticles: [],
          category: article.category,
          countries: [article.country],
          languages: [article.language],
          publishedAt: article.publishedAt,
          keywords: article.keywords || extractKeywords(article.title + ' ' + article.description),
          readTime: estimateReadTime(article.description),
        };
        stories.set(story.id, story);
      }
    });

    return Array.from(stories.values())
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  private transformNewsAPIArticle(item: Record<string, unknown>, idx: number, category: string): NewsArticle {
    const sourceName = (item.source as Record<string, unknown>)?.name as string || 'Unknown';
    const country = this.inferCountryFromSource(sourceName);
    
    return {
      id: `na-${idx}-${Date.now()}`,
      title: item.title as string || 'Untitled',
      description: item.description as string || '',
      content: item.content as string,
      url: item.url as string || '#',
      imageUrl: item.urlToImage as string || this.getFallbackImage(),
      source: {
        id: (item.source as Record<string, unknown>)?.id as string || 'unknown',
        name: sourceName,
        url: `https://${sourceName.toLowerCase().replace(/\s+/g, '')}.com`,
        category,
        language: 'en',
        country,
      },
      author: item.author as string,
      publishedAt: item.publishedAt as string || new Date().toISOString(),
      category,
      language: 'en',
      country,
      keywords: extractKeywords(`${item.title} ${item.description}`),
    };
  }

  private transformGNewsArticle(item: Record<string, unknown>, idx: number, category: string): NewsArticle {
    const sourceName = (item.source as Record<string, unknown>)?.name as string || 'Unknown';
    const country = this.inferCountryFromSource(sourceName);
    
    return {
      id: `gn-${idx}-${Date.now()}`,
      title: item.title as string || 'Untitled',
      description: item.description as string || '',
      content: item.content as string,
      url: item.url as string || '#',
      imageUrl: (item.image as string) || this.getFallbackImage(),
      source: {
        id: (item.source as Record<string, unknown>)?.id as string || 'unknown',
        name: sourceName,
        url: (item.source as Record<string, unknown>)?.url as string || '#',
        category,
        language: 'en',
        country,
      },
      author: item.author as string,
      publishedAt: item.publishedAt as string || new Date().toISOString(),
      category,
      language: 'en',
      country,
      keywords: extractKeywords(`${item.title} ${item.description}`),
    };
  }

  private transformRSSItem(item: CustomItem, source: NewsSource, idx: number, key: string): NewsArticle | null {
    if (!item.title) return null;

    return {
      id: `rss-${key}-${idx}-${Date.now()}`,
      title: item.title,
      description: item.contentSnippet || item.content || item.summary || '',
      content: item['content:encoded'] as string || item.content,
      url: item.link || '#',
      imageUrl: this.extractImageFromRSS(item) || this.getFallbackImage(),
      source: {
        id: key,
        name: source.name,
        url: source.url,
        category: source.category,
        language: source.language,
        country: source.country,
      },
      author: item.creator || item.author,
      publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
      category: source.category,
      language: source.language,
      country: source.country,
      keywords: extractKeywords(`${item.title} ${item.contentSnippet || ''}`),
    };
  }

  private extractImageFromRSS(item: CustomItem): string | null {
    // Try to extract image from various RSS formats
    const mediaContent = item['media:content'] as { $: { url: string } };
    if (mediaContent?.$?.url) return mediaContent.$.url;

    const enclosure = item.enclosure;
    if (enclosure?.url && enclosure.type?.startsWith('image/')) {
      return enclosure.url;
    }

    // Extract from content
    const content = item['content:encoded'] as string || item.content || '';
    const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
    if (imgMatch) return imgMatch[1];

    return null;
  }

  private inferCountryFromSource(sourceName: string): string {
    const name = sourceName.toLowerCase();
    const countryMap: Record<string, string> = {
      'bbc': 'gb',
      'guardian': 'gb',
      'reuters': 'gb',
      'nyt': 'us',
      'new york times': 'us',
      'cnn': 'us',
      'washington post': 'us',
      'npr': 'us',
      'al jazeera': 'qa',
      'asahi': 'jp',
      'the hindu': 'in',
      'times of india': 'in',
      'straits times': 'sg',
      'scmp': 'hk',
      'korea': 'kr',
      'spiegel': 'de',
      'le monde': 'fr',
      'el país': 'es',
      'corriere': 'it',
      'folha': 'br',
      'globo': 'br',
      'clarin': 'ar',
      'abc news': 'au',
      'nz herald': 'nz',
    };

    for (const [key, country] of Object.entries(countryMap)) {
      if (name.includes(key)) return country;
    }

    return 'us';
  }

  private getFallbackImage(): string {
    const images = [
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
      'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80',
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    ];
    return images[Math.floor(Math.random() * images.length)];
  }

  private getMockArticles(filters: NewsFilters, limit: number): NewsArticle[] {
    const mockSources: NewsSource[] = [
      { id: 'demo1', name: 'Global News Network', url: '#', category: 'general', language: 'en', country: 'us' },
      { id: 'demo2', name: 'World Today', url: '#', category: 'general', language: 'en', country: 'gb' },
      { id: 'demo3', name: 'Asia Pacific News', url: '#', category: 'general', language: 'en', country: 'sg' },
      { id: 'demo4', name: 'Africa Daily', url: '#', category: 'general', language: 'en', country: 'za' },
      { id: 'demo5', name: 'European Times', url: '#', category: 'general', language: 'en', country: 'de' },
    ];

    const templates = [
      { title: 'Global Climate Summit Reaches Historic Agreement', category: 'environment', country: 'us' },
      { title: 'New Tech Breakthrough Transforms Industry', category: 'technology', country: 'jp' },
      { title: 'Markets Rally on Economic Data', category: 'business', country: 'gb' },
      { title: 'Peace Talks Progress in Regional Conflict', category: 'world', country: 'za' },
      { title: 'Health Crisis Response Gets International Support', category: 'health', country: 'in' },
      { title: 'Sports Championship Finals Set Records', category: 'sports', country: 'br' },
      { title: 'Entertainment Industry Embraces New Technology', category: 'entertainment', country: 'us' },
      { title: 'Scientific Discovery Opens New Possibilities', category: 'science', country: 'de' },
      { title: 'Political Reform Bill Passes Key Vote', category: 'politics', country: 'fr' },
      { title: 'Cultural Festival Celebrates Diversity', category: 'entertainment', country: 'in' },
    ];

    return Array.from({ length: limit }, (_, i) => {
      const template = templates[i % templates.length];
      const source = mockSources[i % mockSources.length];
      return {
        id: `mock-${i}`,
        title: template.title,
        description: `This is a comprehensive news article about ${template.title.toLowerCase()}. The story covers all the latest developments and provides in-depth analysis of the situation.`,
        url: '#',
        imageUrl: this.getFallbackImage(),
        source,
        publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
        category: filters.category || template.category,
        language: 'en',
        country: source.country,
        keywords: extractKeywords(template.title),
      };
    });
  }
}

export const newsAggregator = new NewsAggregator();

// Helper functions for specific use cases
export async function getBreakingNews(limit = 10) {
  return newsAggregator.getBreakingNews(limit);
}

export async function getTopStories(category?: string, limit = 20) {
  return newsAggregator.getTopStories(category, limit);
}

export async function searchNews(query: string, filters: NewsFilters = {}, page = 1, limit = 20) {
  return newsAggregator.fetchAllSources({ ...filters, query }, page, limit);
}

export async function getNewsByCategory(category: string, page = 1, limit = 20) {
  return newsAggregator.fetchAllSources({ category }, page, limit);
}

export async function getNewsByRegion(regionId: string, page = 1, limit = 50) {
  // Use comprehensive RSS feeds for the region
  const rssArticles = await newsAggregator.fetchRSSByRegion(regionId, limit);
  
  if (rssArticles.length >= limit) {
    return rssArticles;
  }
  
  // Fallback to API if RSS doesn't have enough
  const apiArticles = await newsAggregator.fetchAllSources({}, page, limit - rssArticles.length);
  
  return [...rssArticles, ...apiArticles]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

export async function getNewsByCountry(countryCode: string, page = 1, limit = 30) {
  // Use RSS feeds specific to this country
  const rssArticles = await newsAggregator.fetchRSSByCountry(countryCode, limit);
  
  if (rssArticles.length >= limit) {
    return rssArticles;
  }
  
  // Fallback to API if needed
  const apiArticles = await newsAggregator.fetchAllSources({ country: countryCode }, page, limit - rssArticles.length);
  
  return [...rssArticles, ...apiArticles]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}
