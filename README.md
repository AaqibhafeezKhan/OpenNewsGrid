# Global News Daily

A comprehensive, real-time global news aggregation platform built with Next.js 15, TypeScript, and Tailwind CSS. Aggregates news from 300+ international sources via RSS feeds, news APIs, and web crawlers.

## Features

### Core Capabilities

- **Real-time News Aggregation**: Fetches live news from 300+ global RSS feeds
- **Smart Deduplication**: Merges duplicate stories from multiple sources
- **Multi-Source Coverage**: NewsAPI, GNews, and 300+ RSS feeds
- **Regional Browsing**: Browse by continent, country, or region
- **Category Filtering**: 10 news categories with dedicated pages
- **Search & Filters**: Full-text search with category, country, and language filters
- **Dark Mode**: Automatic theme switching with system preference detection
- **Responsive Design**: Mobile-first design optimized for all devices

### News Sources

- **Asia**: 80+ sources (Japan, India, China, Southeast Asia, South Asia)
- **Europe**: 60+ sources (UK, Germany, France, Nordics, Eastern Europe)
- **Africa**: 50+ sources (Nigeria, South Africa, Kenya, North Africa, West Africa)
- **Americas**: 70+ sources (US, Canada, Brazil, Argentina, Mexico, Latin America)
- **Middle East**: 30+ sources (UAE, Saudi Arabia, Israel, Turkey, Egypt)
- **Oceania**: 15+ sources (Australia, New Zealand, Pacific Islands)

### Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 4.0
- **State**: React Context for theme management
- **Caching**: In-memory cache with TTL
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## Project Structure

```
news-aggregator/
├── app/                    # Next.js App Router pages
│   ├── api/news/          # API routes
│   ├── [category]/        # Category pages (world, tech, business, etc.)
│   ├── search/            # Search page
│   ├── article/           # Article detail page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── header.tsx         # Navigation header
│   ├── footer.tsx         # Site footer
│   ├── breaking-news.tsx  # Breaking news ticker
│   ├── news-card.tsx      # Article card components
│   ├── news-grid.tsx      # Grid layout with infinite scroll
│   ├── skeletons.tsx      # Loading skeletons
│   └── theme-provider.tsx # Dark mode provider
├── lib/                   # Utilities and services
│   ├── utils.ts           # Helper functions
│   ├── cache.ts           # Caching system
│   ├── constants.ts       # Categories, countries, sources
│   ├── news-aggregator.ts # Main aggregation logic
│   ├── rss-aggregator.ts  # RSS feed aggregation (300+ feeds)
│   └── web-crawler.ts     # Web crawler utilities
├── types/                 # TypeScript types
│   └── index.ts           # All type definitions
├── public/                # Static assets
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## Installation

```bash
cd news-aggregator
npm install
```

## Environment Setup

Create a `.env.local` file:

```env
# News API Keys (optional but recommended)
NEWSAPI_KEY=your_newsapi_key
GNEWS_API_KEY=your_gnews_key
CURRENTS_API_KEY=your_currents_key
MEDIASTACK_API_KEY=your_mediastack_key

# Optional: For enhanced caching
REDIS_URL=your_redis_url
```

## Running the App

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start
```

## News Aggregation Architecture

### RSS Feed Aggregation

The app uses `rss-aggregator.ts` which contains 300+ manually curated RSS feeds from:

- Major international news agencies (Reuters, AP, AFP)
- Regional newspapers and broadcasters
- Independent journalism outlets
- Government news agencies
- Technology and business publications

### API Integration

Falls back to News APIs when RSS feeds are insufficient:

- NewsAPI.org
- GNews.io
- Currents API
- MediaStack

### Caching Strategy

- **In-Memory Cache**: 3-5 minute TTL for RSS feeds
- **Next.js ISR**: Static page revalidation
- **CDN Caching**: Edge caching via Vercel

### Deduplication Logic

Articles are deduplicated using:

1. Title similarity (Jaccard index)
2. URL comparison
3. Publication timestamp
4. Source domain analysis

## API Routes

### `/api/news`

Query parameters:

- `action`: `breaking`, `top`, `search`, `category`
- `category`: Category slug
- `q`: Search query
- `page`: Page number
- `limit`: Results per page
- `country`: Country code
- `language`: Language code

Example:

```
GET /api/news?action=top&category=technology&limit=20
GET /api/news?action=search&q=climate&country=us
```

## Customization

### Adding RSS Feeds

Edit `lib/rss-aggregator.ts` and add to `GLOBAL_RSS_FEEDS`:

```typescript
{
  url: 'https://example.com/rss',
  source: {
    id: 'example',
    name: 'Example News',
    url: 'https://example.com',
    category: 'general',
    language: 'en',
    country: 'us'
  }
}
```

### Adding Categories

Edit `lib/constants.ts` and add to `CATEGORIES`:

```typescript
{
  id: 'new-category',
  name: 'New Category',
  slug: 'new-category',
  description: 'Description',
  icon: 'icon-name'
}
```

### Adding Countries

Edit `lib/constants.ts` and add to `COUNTRIES`:

```typescript
{
  code: 'xx',
  name: 'Country Name',
  region: 'region-id',
  flag: '🇨🇳'
}
```

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Environment Variables on Vercel

Set in Vercel dashboard:

- `NEWSAPI_KEY`
- `GNEWS_API_KEY`
- Any other API keys

## Performance

- **Core Web Vitals**: Optimized for < 2.5s LCP
- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Dead code elimination

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add RSS feeds or improve aggregation
4. Submit a pull request

## License

MIT License - feel free to use for personal or commercial projects.

## Credits

- Icons by [Lucide](https://lucide.dev)
- RSS parsing by [rss-parser](https://github.com/rbren/rss-parser)
- Built with [Next.js](https://nextjs.org)

---

**Note**: This is a news aggregation platform. All content is sourced from third-party RSS feeds and APIs. Please respect copyright and terms of service of content providers.
