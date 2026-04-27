import Parser from 'rss-parser';
import { NewsArticle, NewsSource, RSSFeed } from '@/types';
import { extractKeywords, estimateReadTime, generateId, getFlagEmoji } from './utils';
import { globalCache, generateCacheKey } from './cache';

const rssParser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
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

// Comprehensive Global RSS Feed Database
export const GLOBAL_RSS_FEEDS: RSSFeed[] = [
  // === ASIA ===
  // Japan
  { url: 'https://www.asahi.com/english/rss/', category: 'general', source: { id: 'asahi', name: 'Asahi Shimbun', url: 'https://www.asahi.com', category: 'general', language: 'en', country: 'jp' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // India
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // China
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // Southeast Asia
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // South Asia
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // East Asia
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // === EUROPE ===
  // UK & Ireland
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // France
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // Germany
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // Other Europe
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
];

// Additional feeds to fetch (Middle East, Africa, Americas)
export const ADDITIONAL_FEEDS: RSSFeed[] = [
  // === MIDDLE EAST ===
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // === AFRICA ===
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // === AMERICAS ===
  // North America - US
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // Canada
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // Latin America - Brazil
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // Argentina
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // Mexico
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // Chile
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // Colombia
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // Peru
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // Venezuela
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // Other Latin America
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // === OCEANIA ===
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // === TECHNOLOGY ===
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // === SCIENCE & ENVIRONMENT ===
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // === HEALTH ===
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // === SPORTS ===
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  
  // === INDEPENDENT & ALTERNATIVE ===
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
  { url: '', category: '', source: { id: '', name: '', url: '', category: '', language: '', country: '' } },
];

// Combine all feeds
export const ALL_RSS_FEEDS = [...GLOBAL_RSS_FEEDS, ...ADDITIONAL_FEEDS];

export class RSSAggregator {
  private feedCache = new Map<string, NewsArticle[]>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async fetchFeed(feed: RSSFeed, limit: number = 10): Promise<NewsArticle[]> {
    const cacheKey = `${feed.source.id}:${limit}`;
    const cached = globalCache.get<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    try {
      const parsed = await rssParser.parseURL(feed.url);
      const articles: NewsArticle[] = [];

      parsed.items?.slice(0, limit).forEach((item, idx) => {
        const article = this.transformRSSItem(item, feed.source, idx);
        if (article) articles.push(article);
      });

      globalCache.set(cacheKey, articles, this.CACHE_TTL);
      return articles;
    } catch (error) {
      console.error(`RSS fetch error for ${feed.source.name}:`, error);
      return [];
    }
  }

  async fetchAllFeeds(category?: string, limitPerFeed: number = 5, maxFeeds: number = 50): Promise<NewsArticle[]> {
    const cacheKey = generateCacheKey('all-rss', { category, limitPerFeed, maxFeeds });
    const cached = globalCache.get<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    let feeds = ALL_RSS_FEEDS;
    if (category && category !== 'general') {
      feeds = feeds.filter(f => f.source.category === category);
    }
    
    // Shuffle and limit feeds for diversity
    feeds = feeds
      .sort(() => Math.random() - 0.5)
      .slice(0, maxFeeds);

    const allArticles: NewsArticle[] = [];

    // Fetch in batches to avoid overwhelming
    const batchSize = 10;
    for (let i = 0; i < feeds.length; i += batchSize) {
      const batch = feeds.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(feed => this.fetchFeed(feed, limitPerFeed))
      );
      
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          allArticles.push(...result.value);
        }
      });
    }

    // Sort by date and deduplicate
    const unique = allArticles
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .filter((article, idx, self) => 
        idx === self.findIndex(a => a.title === article.title)
      );

    globalCache.set(cacheKey, unique, this.CACHE_TTL);
    return unique;
  }

  async fetchByRegion(regionId: string, limit: number = 30): Promise<NewsArticle[]> {
    const cacheKey = `region-rss:${regionId}:${limit}`;
    const cached = globalCache.get<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    const feeds = ALL_RSS_FEEDS.filter(f => {
      // Map countries to regions
      const regionMap: Record<string, string[]> = {
        'asia': ['jp', 'cn', 'in', 'kr', 'id', 'th', 'vn', 'ph', 'my', 'sg', 'bd', 'pk', 'lk', 'np', 'mm', 'mn', 'tw', 'hk', 'kh', 'la', 'bt', 'mv', 'af'],
        'europe': ['gb', 'de', 'fr', 'it', 'es', 'nl', 'be', 'ch', 'at', 'se', 'no', 'dk', 'fi', 'pl', 'cz', 'hu', 'ro', 'bg', 'hr', 'rs', 'ua', 'gr', 'pt', 'ie', 'ru', 'by', 'ee', 'lv', 'lt', 'si', 'ba', 'mk', 'al', 'mt', 'cy', 'is'],
        'africa': ['za', 'ng', 'eg', 'ke', 'et', 'tz', 'ug', 'gh', 'ma', 'dz', 'tn', 'sn', 'ci', 'cm', 'zw', 'zm', 'bw', 'na', 'mz', 'mg', 'rw', 'ss', 'sd', 'ly'],
        'north-america': ['us', 'ca', 'mx', 'cu', 'gt', 'hn', 'sv', 'ni', 'cr', 'pa', 'jm', 'ht', 'do', 'pr'],
        'south-america': ['br', 'ar', 'cl', 'co', 'pe', 've', 'ec', 'bo', 'py', 'uy', 'gy', 'sr', 'gf'],
        'middle-east': ['sa', 'ae', 'qa', 'kw', 'bh', 'om', 'ye', 'iq', 'ir', 'jo', 'lb', 'sy', 'il', 'ps', 'tr', 'cy'],
        'oceania': ['au', 'nz', 'pg', 'fj', 'sb', 'vu', 'nc', 'pf', 'ws', 'to', 'ki', 'tv', 'nr'],
      };
      return regionMap[regionId]?.includes(f.source.country);
    });

    const allArticles: NewsArticle[] = [];
    const results = await Promise.allSettled(
      feeds.slice(0, 20).map(feed => this.fetchFeed(feed, 3))
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

    globalCache.set(cacheKey, unique, this.CACHE_TTL);
    return unique;
  }

  private transformRSSItem(item: Parser.Item, source: NewsSource, idx: number): NewsArticle | null {
    if (!item.title) return null;

    const title = item.title.trim();
    const description = item.contentSnippet || item.summary || item.content || '';
    
    // Extract image
    let imageUrl = this.extractImageFromRSS(item);
    if (!imageUrl) {
      // Fallback images by category
      const fallbacks: Record<string, string> = {
        'general': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
        'technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
        'business': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
        'sports': 'https://images.unsplash.com/photo-1461896836934- voices-60c9d61d7b31?w=800&q=80',
        'science': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80',
        'health': 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&q=80',
        'environment': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
      };
      imageUrl = fallbacks[source.category] || fallbacks['general'];
    }

    // Parse date
    let publishedAt = item.isoDate || item.pubDate;
    if (!publishedAt) {
      publishedAt = new Date().toISOString();
    }

    return {
      id: `rss-${source.id}-${idx}-${Date.now()}`,
      title: title,
      description: description.slice(0, 500),
      content: item['content:encoded'] as string || item.content,
      url: item.link || source.url,
      imageUrl: imageUrl,
      source: {
        id: source.id,
        name: source.name,
        url: source.url,
        category: source.category,
        language: source.language,
        country: source.country,
      },
      author: item.creator || item.author || source.name,
      publishedAt: publishedAt,
      category: source.category,
      language: source.language,
      country: source.country,
      keywords: extractKeywords(`${title} ${description}`),
    };
  }

  private extractImageFromRSS(item: Parser.Item): string | null {
    // Try media:content
    const mediaContent = item['media:content'] as { $: { url: string }; url?: string };
    if (mediaContent?.$?.url) return mediaContent.$.url;
    // Try media:thumbnail
    const mediaThumbnail = (item as any)['media:thumbnail'];
    if (mediaThumbnail?.$?.url) return mediaThumbnail.$.url;

    // Try enclosure
    if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
      return item.enclosure.url;
    }

    // Extract from content
    const content = item['content:encoded'] as string || item.content || '';
    const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
    if (imgMatch) return imgMatch[1];

    return null;
  }
}

export const rssAggregator = new RSSAggregator();
