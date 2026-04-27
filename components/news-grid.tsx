"use client";

import { useState } from "react";
import { NewsCard } from "./news-card";
import { NewsCardSkeleton } from "./skeletons";
import { NewsArticle, AggregatedStory } from "@/types";
import { Loader2 } from "lucide-react";

interface NewsGridProps {
  articles?: NewsArticle[];
  stories?: AggregatedStory[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  variant?: "default" | "compact" | "horizontal";
  columns?: 1 | 2 | 3 | 4;
  showFeatured?: boolean;
}

export function NewsGrid({
  articles,
  stories,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  variant = "default",
  columns = 3,
  showFeatured = true,
}: NewsGridProps) {
  const [loadingMore, setLoadingMore] = useState(false);

  const items =
    stories ||
    articles?.map(
      (a) =>
        ({
          id: a.id,
          headline: a.title,
          summary: a.description,
          imageUrl: a.imageUrl,
          sources: [a.source],
          primaryArticle: a,
          relatedArticles: [],
          category: a.category,
          countries: [a.country],
          languages: [a.language],
          publishedAt: a.publishedAt,
          keywords: a.keywords || [],
          readTime: 3,
        }) as AggregatedStory,
    ) ||
    [];

  const handleLoadMore = async () => {
    if (!onLoadMore || loadingMore) return;
    setLoadingMore(true);
    await onLoadMore();
    setLoadingMore(false);
  };

  const getGridClasses = () => {
    switch (columns) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  if (isLoading) {
    return (
      <div className={`grid ${getGridClasses()} gap-6`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <NewsCardSkeleton key={i} variant={variant} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No news articles found.
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
          Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  const featuredItem = showFeatured ? items[0] : null;
  const gridItems = showFeatured ? items.slice(1) : items;

  return (
    <div className="space-y-8">
      {/* Featured Story */}
      {featuredItem && (
        <div className="mb-8">
          <NewsCard story={featuredItem} variant="featured" />
        </div>
      )}

      {/* Grid */}
      {variant === "horizontal" ? (
        <div className="space-y-4">
          {gridItems.map((item) => (
            <NewsCard key={item.id} story={item} variant="horizontal" />
          ))}
        </div>
      ) : variant === "compact" ? (
        <div className="space-y-2">
          {gridItems.map((item) => (
            <NewsCard key={item.id} story={item} variant="compact" />
          ))}
        </div>
      ) : (
        <div className={`grid ${getGridClasses()} gap-6`}>
          {gridItems.map((item) => (
            <NewsCard key={item.id} story={item} variant="default" />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More News"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
