import { Metadata } from "next";
import { NewsGrid } from "@/components/news-grid";
import { getTopStories, getNewsByCategory } from "@/lib/news-aggregator";
import { CATEGORIES } from "@/lib/constants";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORIES.find((c) => c.slug === category);
  if (!cat) return { title: "Category Not Found" };

  return {
    title: `${cat.name} News - Global News Daily`,
    description: `Latest ${cat.name.toLowerCase()} news from around the world. ${cat.description}`,
  };
}

export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({
    category: cat.slug,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const cat = CATEGORIES.find((c) => c.slug === category);

  if (!cat) {
    notFound();
  }

  // Fetch both aggregated stories and raw articles
  const [stories, articles] = await Promise.all([
    getTopStories(category, 12),
    getNewsByCategory(category, 1, 6),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-primary text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold">
            {cat.name} News
          </h1>
          <p className="mt-2 text-white/80">{cat.description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Stories */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Top Stories
          </h2>
          <NewsGrid
            stories={stories}
            variant="default"
            columns={3}
            showFeatured={true}
          />
        </section>

        {/* Latest Articles */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Latest Updates
          </h2>
          <NewsGrid
            articles={articles}
            variant="horizontal"
            columns={1}
            showFeatured={false}
          />
        </section>
      </div>
    </div>
  );
}
