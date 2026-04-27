import { BreakingNews } from '@/components/breaking-news';
import { NewsGrid } from '@/components/news-grid';
import { getBreakingNews, getTopStories, getNewsByCategory } from '@/lib/news-aggregator';
import { CATEGORIES } from '@/lib/constants';
import Link from 'next/link';
import { TrendingUp, Globe, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function HomePage() {
  const [breakingNews, topStories, worldNews, techNews, businessNews] = await Promise.all([
    getBreakingNews(8),
    getTopStories(undefined, 13),
    getNewsByCategory('world', 1, 5),
    getNewsByCategory('technology', 1, 5),
    getNewsByCategory('business', 1, 5),
  ]);

  const featuredStory = topStories[0];
  const mainGridStories = topStories.slice(1, 7);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <BreakingNews articles={breakingNews} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {featuredStory && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Story</h2>
            </div>
            <NewsGrid stories={[featuredStory]} variant="default" columns={1} showFeatured={true} />
          </section>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Latest Headlines</h2>
                </div>
                <Link 
                  href="/general" 
                  className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  View All →
                </Link>
              </div>
              <NewsGrid stories={mainGridStories} variant="default" columns={2} showFeatured={false} />
            </section>

            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">World News</h2>
                <Link 
                  href="/world" 
                  className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  More World →
                </Link>
              </div>
              <NewsGrid 
                articles={worldNews} 
                variant="horizontal" 
                columns={1} 
                showFeatured={false} 
              />
            </section>
          </div>

          <aside className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Trending Topics</h3>
              <div className="flex flex-wrap gap-2">
                {featuredStory?.keywords?.map((keyword) => (
                  <Link
                    key={keyword}
                    href={`/search?q=${encodeURIComponent(keyword)}`}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-primary hover:text-white transition-colors"
                  >
                    #{keyword}
                  </Link>
                )) || ['Politics', 'Technology', 'Climate', 'Economy', 'Sports'].map(tag => (
                  <Link
                    key={tag}
                    href={`/search?q=${tag}`}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-primary hover:text-white transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Technology</h3>
                <Link 
                  href="/technology" 
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  More →
                </Link>
              </div>
              <div className="space-y-4">
                {techNews.slice(0, 4).map((article) => (
                  <Link
                    key={article.id}
                    href={`/article/${encodeURIComponent(article.url)}`}
                    className="block group"
                  >
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {article.source.name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Business</h3>
                <Link 
                  href="/business" 
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  More →
                </Link>
              </div>
              <div className="space-y-4">
                {businessNews.slice(0, 4).map((article) => (
                  <Link
                    key={article.id}
                    href={`/article/${encodeURIComponent(article.url)}`}
                    className="block group"
                  >
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {article.source.name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-6 text-white">
              <h3 className="font-bold mb-4">Explore Categories</h3>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.slice(1).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/${cat.slug}`}
                    className="px-3 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
