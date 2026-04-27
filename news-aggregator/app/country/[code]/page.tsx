import { Metadata } from 'next';
import { NewsGrid } from '@/components/news-grid';
import { getNewsByCountry, getBreakingNews } from '@/lib/news-aggregator';
import { COUNTRIES, REGIONS } from '@/lib/constants';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Globe2, Newspaper, ExternalLink } from 'lucide-react';

interface CountryPageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { code } = await params;
  const country = COUNTRIES.find(c => c.code === code);
  if (!country) return { title: 'Country Not Found' };
  
  return {
    title: `${country.name} News - Global News Daily`,
    description: `Latest news and headlines from ${country.name}. Breaking stories from ${country.name}'s top news sources.`,
  };
}

export async function generateStaticParams() {
  return COUNTRIES.map((country) => ({
    code: country.code,
  }));
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { code } = await params;
  const country = COUNTRIES.find(c => c.code === code);
  
  if (!country) {
    notFound();
  }

  const region = REGIONS.find(r => r.id === country.region);
  
  // Fetch news for this country
  const [countryNews] = await Promise.all([
    getNewsByCountry(code, 1, 30),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Link 
              href={`/region/${country.region}`}
              className="text-white/80 hover:text-white text-sm flex items-center gap-1"
            >
              <Globe2 className="h-4 w-4" />
              {region?.name}
            </Link>
            <span className="text-white/50">/</span>
            <span className="text-white/80 text-sm">Country</span>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl">{country.flag}</span>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold">{country.name}</h1>
              <p className="text-white/80 mt-1">
                Latest news from {country.name}'s top sources
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {countryNews.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No articles available
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              We&apos;re unable to fetch news from {country.name} at the moment. 
              Try browsing the {region?.name} region instead.
            </p>
            <Link 
              href={`/region/${country.region}`}
              className="inline-block mt-4 text-primary hover:underline"
            >
              View {region?.name} News →
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <Newspaper className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Latest from {country.name}
                  </h2>
                </div>
                <NewsGrid 
                  articles={countryNews.slice(0, 9)} 
                  variant="default" 
                  columns={2} 
                  showFeatured={true}
                />
              </section>

              {countryNews.length > 9 && (
                <section>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    More Stories
                  </h2>
                  <NewsGrid 
                    articles={countryNews.slice(9)} 
                    variant="horizontal" 
                    columns={1}
                  />
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Country Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-gray-900 dark:text-white">About</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Country</span>
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {country.flag} {country.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Region</span>
                    <Link 
                      href={`/region/${country.region}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {region?.name}
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Articles</span>
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {countryNews.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Neighboring Countries */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Region</h3>
                <Link
                  href={`/region/${country.region}`}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Globe2 className="h-4 w-4 text-primary" />
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {region?.name}
                    </span>
                  </span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </Link>
              </div>

              {/* Other Countries in Region */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  More in {region?.name}
                </h3>
                <div className="space-y-2">
                  {COUNTRIES
                    .filter(c => c.region === country.region && c.code !== code)
                    .slice(0, 8)
                    .map((c) => (
                      <Link
                        key={c.code}
                        href={`/country/${c.code}`}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <span>{c.flag}</span>
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          {c.name}
                        </span>
                      </Link>
                    ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
