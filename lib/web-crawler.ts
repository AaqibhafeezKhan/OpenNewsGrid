import { NewsArticle, NewsSource } from '@/types';
import { extractKeywords, estimateReadTime, generateId, getFlagEmoji } from './utils';
import { globalCache } from './cache';

const CRAWL_TARGETS = [
  {
    name: 'Google News',
    url: 'https://news.google.com/rss',
    type: 'rss',
    country: 'us',
    category: 'general',
  },
  {
    name: 'Bing News',
    url: 'https://www.bing.com/news/search?q=world+news&format=rss',
    type: 'rss',
    country: 'us',
    category: 'general',
  },
  {
    name: 'Yahoo News',
    url: 'https://www.yahoo.com/news/rss',
    type: 'rss',
    country: 'us',
    category: 'general',
  },
  {
    name: 'Reuters',
    url: 'https://www.reutersagency.com/feed/?best-topics=world',
    type: 'rss',
    country: 'gb',
    category: 'general',
  },
  {
    name: 'Associated Press',
    url: 'https://rsshub.app/apnews/topics/apf-topnews',
    type: 'rss',
    country: 'us',
    category: 'general',
  },
  {
    name: 'Agence France-Presse',
    url: 'https://rsshub.app/afp-news/',
    type: 'rss',
    country: 'fr',
    category: 'general',
  },
  {
    name: 'EFE News',
    url: 'https://rsshub.app/efe-news/',
    type: 'rss',
    country: 'es',
    category: 'general',
  },
  {
    name: 'ITAR-TASS',
    url: 'https://rsshub.app/tass-news/',
    type: 'rss',
    country: 'ru',
    category: 'general',
  },
  {
    name: 'Xinhua News',
    url: 'https://rsshub.app/xinhua-news/',
    type: 'rss',
    country: 'cn',
    category: 'general',
  },
  {
    name: 'Kyodo News',
    url: 'https://rsshub.app/kyodo-news/',
    type: 'rss',
    country: 'jp',
    category: 'general',
  },
  {
    name: 'Yonhap News',
    url: 'https://rsshub.app/yonhap-news/',
    type: 'rss',
    country: 'kr',
    category: 'general',
  },
  {
    name: 'Antara News',
    url: 'https://rsshub.app/antara-news/',
    type: 'rss',
    country: 'id',
    category: 'general',
  },
  {
    name: 'Bernama',
    url: 'https://rsshub.app/bernama-news/',
    type: 'rss',
    country: 'my',
    category: 'general',
  },
  {
    name: 'PTI India',
    url: 'https://rsshub.app/pti-news/',
    type: 'rss',
    country: 'in',
    category: 'general',
  },
  {
    name: 'ANSA Italy',
    url: 'https://rsshub.app/ansa-news/',
    type: 'rss',
    country: 'it',
    category: 'general',
  },
  {
    name: 'DPA Germany',
    url: 'https://rsshub.app/dpa-news/',
    type: 'rss',
    country: 'de',
    category: 'general',
  },
  {
    name: 'ANP Netherlands',
    url: 'https://rsshub.app/anp-news/',
    type: 'rss',
    country: 'nl',
    category: 'general',
  },
  {
    name: 'Belga Belgium',
    url: 'https://rsshub.app/belga-news/',
    type: 'rss',
    country: 'be',
    category: 'general',
  },
  {
    name: 'Austria Presse Agentur',
    url: 'https://rsshub.app/apa-news/',
    type: 'rss',
    country: 'at',
    category: 'general',
  },
  {
    name: 'TT Sweden',
    url: 'https://rsshub.app/tt-news/',
    type: 'rss',
    country: 'se',
    category: 'general',
  },
  {
    name: 'NTB Norway',
    url: 'https://rsshub.app/ntb-news/',
    type: 'rss',
    country: 'no',
    category: 'general',
  },
  {
    name: 'STT Finland',
    url: 'https://rsshub.app/stt-news/',
    type: 'rss',
    country: 'fi',
    category: 'general',
  },
  {
    name: 'Ritzau Denmark',
    url: 'https://rsshub.app/ritzau-news/',
    type: 'rss',
    country: 'dk',
    category: 'general',
  },
  {
    name: 'PAP Poland',
    url: 'https://rsshub.app/pap-news/',
    type: 'rss',
    country: 'pl',
    category: 'general',
  },
  {
    name: 'CTK Czech',
    url: 'https://rsshub.app/ctk-news/',
    type: 'rss',
    country: 'cz',
    category: 'general',
  },
  {
    name: 'MTI Hungary',
    url: 'https://rsshub.app/mti-news/',
    type: 'rss',
    country: 'hu',
    category: 'general',
  },
  {
    name: 'TASR Slovakia',
    url: 'https://rsshub.app/tasr-news/',
    type: 'rss',
    country: 'sk',
    category: 'general',
  },
  {
    name: 'BTA Bulgaria',
    url: 'https://rsshub.app/bta-news/',
    type: 'rss',
    country: 'bg',
    category: 'general',
  },
  {
    name: 'Agerpres Romania',
    url: 'https://rsshub.app/agerpres-news/',
    type: 'rss',
    country: 'ro',
    category: 'general',
  },
  {
    name: 'AMNA Greece',
    url: 'https://rsshub.app/amna-news/',
    type: 'rss',
    country: 'gr',
    category: 'general',
  },
  {
    name: 'ANA Turkey',
    url: 'https://rsshub.app/ana-news/',
    type: 'rss',
    country: 'tr',
    category: 'general',
  },
  {
    name: ' Petra Jordan',
    url: 'https://rsshub.app/petra-news/',
    type: 'rss',
    country: 'jo',
    category: 'general',
  },
  {
    name: 'MENA Egypt',
    url: 'https://rsshub.app/mena-news/',
    type: 'rss',
    country: 'eg',
    category: 'general',
  },
  {
    name: 'SUNA Sudan',
    url: 'https://rsshub.app/suna-news/',
    type: 'rss',
    country: 'sd',
    category: 'general',
  },
  {
    name: 'ENA Ethiopia',
    url: 'https://rsshub.app/ena-news/',
    type: 'rss',
    country: 'et',
    category: 'general',
  },
  {
    name: 'KNA Kenya',
    url: 'https://rsshub.app/kna-news/',
    type: 'rss',
    country: 'ke',
    category: 'general',
  },
  {
    name: 'NAN Nigeria',
    url: 'https://rsshub.app/nan-news/',
    type: 'rss',
    country: 'ng',
    category: 'general',
  },
  {
    name: 'SANA Ghana',
    url: 'https://rsshub.app/sana-news/',
    type: 'rss',
    country: 'gh',
    category: 'general',
  },
  {
    name: 'SABA Yemen',
    url: 'https://rsshub.app/saba-news/',
    type: 'rss',
    country: 'ye',
    category: 'general',
  },
  {
    name: 'INA Iraq',
    url: 'https://rsshub.app/ina-news/',
    type: 'rss',
    country: 'iq',
    category: 'general',
  },
  {
    name: 'IRNA Iran',
    url: 'https://rsshub.app/irna-news/',
    type: 'rss',
    country: 'ir',
    category: 'general',
  },
  {
    name: 'WAM UAE',
    url: 'https://rsshub.app/wam-news/',
    type: 'rss',
    country: 'ae',
    category: 'general',
  },
  {
    name: 'SPA Saudi',
    url: 'https://rsshub.app/spa-news/',
    type: 'rss',
    country: 'sa',
    category: 'general',
  },
  {
    name: 'KUNA Kuwait',
    url: 'https://rsshub.app/kuna-news/',
    type: 'rss',
    country: 'kw',
    category: 'general',
  },
  {
    name: 'QNA Qatar',
    url: 'https://rsshub.app/qna-news/',
    type: 'rss',
    country: 'qa',
    category: 'general',
  },
  {
    name: 'ONA Oman',
    url: 'https://rsshub.app/ona-news/',
    type: 'rss',
    country: 'om',
    category: 'general',
  },
  {
    name: 'BNA Bahrain',
    url: 'https://rsshub.app/bna-news/',
    type: 'rss',
    country: 'bh',
    category: 'general',
  },
  {
    name: 'SANA Syria',
    url: 'https://rsshub.app/sana-syria-news/',
    type: 'rss',
    country: 'sy',
    category: 'general',
  },
  {
    name: 'NNA Lebanon',
    url: 'https://rsshub.app/nna-news/',
    type: 'rss',
    country: 'lb',
    category: 'general',
  },
  {
    name: 'WAFA Palestine',
    url: 'https://rsshub.app/wafa-news/',
    type: 'rss',
    country: 'ps',
    category: 'general',
  },
  {
    name: 'TELAM Argentina',
    url: 'https://rsshub.app/telam-news/',
    type: 'rss',
    country: 'ar',
    category: 'general',
  },
  {
    name: 'EFE Latin America',
    url: 'https://rsshub.app/efe-latam/',
    type: 'rss',
    country: 'es',
    category: 'general',
  },
  {
    name: 'Notimex Mexico',
    url: 'https://rsshub.app/notimex-news/',
    type: 'rss',
    country: 'mx',
    category: 'general',
  },
  {
    name: 'LUSA Portugal',
    url: 'https://rsshub.app/lusa-news/',
    type: 'rss',
    country: 'pt',
    category: 'general',
  },
  {
    name: 'ATS Switzerland',
    url: 'https://rsshub.app/ats-news/',
    type: 'rss',
    country: 'ch',
    category: 'general',
  },
  {
    name: 'SDA Switzerland',
    url: 'https://rsshub.app/sda-news/',
    type: 'rss',
    country: 'ch',
    category: 'general',
  },
  {
    name: 'AAP Australia',
    url: 'https://rsshub.app/aap-news/',
    type: 'rss',
    country: 'au',
    category: 'general',
  },
  {
    name: 'NZPA New Zealand',
    url: 'https://rsshub.app/nzpa-news/',
    type: 'rss',
    country: 'nz',
    category: 'general',
  },
  {
    name: 'PNA Philippines',
    url: 'https://rsshub.app/pna-news/',
    type: 'rss',
    country: 'ph',
    category: 'general',
  },
  {
    name: 'VNA Vietnam',
    url: 'https://rsshub.app/vna-news/',
    type: 'rss',
    country: 'vn',
    category: 'general',
  },
  {
    name: 'KCNA North Korea',
    url: 'https://rsshub.app/kcna-news/',
    type: 'rss',
    country: 'kp',
    category: 'general',
  },
  {
    name: 'KCNA South Korea',
    url: 'https://rsshub.app/yonhap-news/',
    type: 'rss',
    country: 'kr',
    category: 'general',
  },
];

const NEWS_APIS = [
  {
    name: 'NewsAPI',
    endpoint: 'https://newsapi.org/v2/top-headlines',
    params: { sources: 'bbc-news,cnn,reuters,associated-press,al-jazeera-english' },
  },
  {
    name: 'GNews',
    endpoint: 'https://gnews.io/api/v4/top-headlines',
    params: { lang: 'en', country: 'us,gb,ca,au,in,de,fr,jp,cn,br,za' },
  },
  {
    name: 'Currents API',
    endpoint: 'https://api.currentsapi.services/v1/latest-news',
    params: { language: 'en' },
  },
  {
    name: 'NewsData',
    endpoint: 'https://newsdata.io/api/1/news',
    params: { language: 'en', country: 'us,gb,ca,au,in,de,fr,jp,cn,br,za,ng,eg,ke' },
  },
  {
    name: 'MediaStack',
    endpoint: 'https://api.mediastack.com/v1/news',
    params: { languages: 'en,-de,-fr,-es', countries: 'us,gb,de,fr,it,es,ru,cn,jp,in,br,ca,au,za,ng,eg' },
  },
  {
    name: 'Newscatcher',
    endpoint: 'https://v3-api.newscatcherapi.com/api/latest_headlines',
    params: { lang: 'en', countries: 'US,GB,CA,AU,DE,FR,IT,JP,IN,BR' },
  },
  {
    name: 'World News API',
    endpoint: 'https://api.worldnewsapi.com/search-news',
    params: { language: 'eng', source-countries: 'us,gb,de,fr,jp,in,br,ca,au' },
  },
];

export class WebCrawler {
  private cache = new Map<string, NewsArticle[]>();
  private readonly CACHE_TTL = 3 * 60 * 1000;

  async crawlNewsAPIs(limit: number = 50): Promise<NewsArticle[]> {
    const cacheKey = `apis:${limit}`;
    const cached = globalCache.get<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    const allArticles: NewsArticle[] = [];
    
    globalCache.set(cacheKey, allArticles, this.CACHE_TTL);
    return allArticles;
  }

  async crawlAggregators(limit: number = 30): Promise<NewsArticle[]> {
    const cacheKey = `aggregators:${limit}`;
    const cached = globalCache.get<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    const allArticles: NewsArticle[] = [];
    
    globalCache.set(cacheKey, allArticles, this.CACHE_TTL);
    return allArticles;
  }

  async fetchFromWikipediaCurrentEvents(): Promise<NewsArticle[]> {
    const cacheKey = 'wikipedia-current';
    const cached = globalCache.get<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    const articles: NewsArticle[] = [];
    
    globalCache.set(cacheKey, articles, this.CACHE_TTL);
    return articles;
  }

  async fetchFromRedditWorldNews(limit: number = 20): Promise<NewsArticle[]> {
    const cacheKey = `reddit:${limit}`;
    const cached = globalCache.get<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    const articles: NewsArticle[] = [];
    
    globalCache.set(cacheKey, articles, this.CACHE_TTL);
    return articles;
  }

  async fetchFromHackerNews(): Promise<NewsArticle[]> {
    const cacheKey = 'hackernews';
    const cached = globalCache.get<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    const articles: NewsArticle[] = [];
    
    globalCache.set(cacheKey, articles, this.CACHE_TTL);
    return articles;
  }

  async fetchAllSources(limit: number = 100): Promise<NewsArticle[]> {
    const [apis, aggregators, reddit, hackernews] = await Promise.allSettled([
      this.crawlNewsAPIs(Math.ceil(limit / 4)),
      this.crawlAggregators(Math.ceil(limit / 4)),
      this.fetchFromRedditWorldNews(Math.ceil(limit / 4)),
      this.fetchFromHackerNews(),
    ]);

    const allArticles: NewsArticle[] = [];

    if (apis.status === 'fulfilled') allArticles.push(...apis.value);
    if (aggregators.status === 'fulfilled') allArticles.push(...aggregators.value);
    if (reddit.status === 'fulfilled') allArticles.push(...reddit.value);
    if (hackernews.status === 'fulfilled') allArticles.push(...hackernews.value);

    return allArticles
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .filter((article, idx, self) => 
        idx === self.findIndex(a => a.title === article.title)
      )
      .slice(0, limit);
  }
}

export const webCrawler = new WebCrawler();
