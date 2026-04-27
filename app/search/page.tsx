'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { NewsGrid } from '@/components/news-grid';
import { NewsCardSkeleton } from '@/components/skeletons';
import { searchNews } from '@/lib/news-aggregator';
import { NewsArticle, NewsFilters } from '@/types';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES, COUNTRIES, LANGUAGES } from '@/lib/constants';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<NewsFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, 1);
    } else {
      setIsLoading(false);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string, pageNum: number) => {
    setIsLoading(true);
    try {
      const results = await searchNews(searchQuery, filters, pageNum, 20);
      if (pageNum === 1) {
        setArticles(results);
      } else {
        setArticles(prev => [...prev, ...results]);
      }
      setHasMore(results.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query, 1);
      // Update URL
      const url = new URL(window.location.href);
      url.searchParams.set('q', query);
      window.history.pushState({}, '', url);
    }
  };

  const handleLoadMore = () => {
    performSearch(query, page + 1);
  };

  const updateFilter = (key: keyof NewsFilters, value: string | undefined) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    if (query) {
      performSearch(query, 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Search News
          </h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for news, topics, or sources..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg border font-medium transition-colors ${
                showFilters 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              Search
            </button>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow mb-4">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => updateFilter('category', e.target.value || undefined)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Country Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Country
                  </label>
                  <select
                    value={filters.country || ''}
                    onChange={(e) => updateFilter('country', e.target.value || undefined)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Countries</option>
                    {COUNTRIES.slice(0, 20).map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Language
                  </label>
                  <select
                    value={filters.language || ''}
                    onChange={(e) => updateFilter('language', e.target.value || undefined)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Languages</option>
                    {LANGUAGES.slice(0, 15).map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filters */}
              {(filters.category || filters.country || filters.language) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
                  {filters.category && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                      {CATEGORIES.find(c => c.id === filters.category)?.name}
                      <button onClick={() => updateFilter('category', undefined)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.country && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                      {COUNTRIES.find(c => c.code === filters.country)?.flag} {COUNTRIES.find(c => c.code === filters.country)?.name}
                      <button onClick={() => updateFilter('country', undefined)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {query ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoading && page === 1 ? 'Searching...' : `${articles.length} results for "${query}"`}
              </h2>
            </div>
            <NewsGrid 
              articles={articles} 
              isLoading={isLoading && page === 1}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              variant="default"
              columns={3}
              showFeatured={false}
            />
          </>
        ) : (
          <div className="text-center py-16">
            <Search className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Enter a search term to find news articles
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 skeleton rounded mb-4" />
          <div className="h-12 w-full skeleton rounded mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <NewsCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
