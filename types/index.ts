export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content?: string;
  url: string;
  imageUrl: string;
  source: NewsSource;
  author?: string;
  publishedAt: string;
  category: string;
  language: string;
  country: string;
  keywords?: string[];
  relatedArticles?: string[];
}

export interface NewsSource {
  id: string;
  name: string;
  description?: string;
  url: string;
  category: string;
  language: string;
  country: string;
  favicon?: string;
}

export interface AggregatedStory {
  id: string;
  headline: string;
  summary: string;
  imageUrl: string;
  sources: NewsSource[];
  primaryArticle: NewsArticle;
  relatedArticles: NewsArticle[];
  category: string;
  countries: string[];
  languages: string[];
  publishedAt: string;
  keywords: string[];
  readTime: number;
}

export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface Region {
  id: string;
  name: string;
  slug: string;
  countries: string[];
  languages: string[];
}

export interface Country {
  code: string;
  name: string;
  region: string;
  languages: string[];
  flag: string;
}

export interface NewsFilters {
  query?: string;
  category?: string;
  country?: string;
  language?: string;
  source?: string;
  from?: string;
  to?: string;
  sortBy?: 'publishedAt' | 'relevance';
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface RSSFeed {
  url: string;
  source: NewsSource;
  category: string;
}
