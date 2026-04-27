"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, ExternalLink, Share2 } from "lucide-react";
import { NewsArticle, AggregatedStory } from "@/types";
import { formatTimeAgo, estimateReadTime, truncateText } from "@/lib/utils";
import { getFlagEmoji } from "@/lib/utils";

interface NewsCardProps {
  article?: NewsArticle;
  story?: AggregatedStory;
  variant?: "default" | "featured" | "compact" | "horizontal";
}

export function NewsCard({
  article,
  story,
  variant = "default",
}: NewsCardProps) {
  const data =
    story ||
    (article
      ? ({
          id: article.id,
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
          keywords: article.keywords || [],
          readTime: estimateReadTime(article.description),
        } as AggregatedStory)
      : null);

  if (!data) return null;

  const readTime = data.readTime || estimateReadTime(data.summary);
  const hasMultipleSources = data.sources.length > 1;
  const sourceLabel = hasMultipleSources
    ? `${data.sources.length} sources`
    : data.sources[0]?.name;

  if (variant === "featured") {
    return (
      <article className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
        <Link
          href={`/article/${encodeURIComponent(data.primaryArticle.url)}`}
          className="block"
        >
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative h-64 md:h-full min-h-[300px] overflow-hidden">
              <Image
                src={data.imageUrl}
                alt={data.headline}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-block px-3 py-1 bg-accent text-white text-xs font-bold uppercase tracking-wider rounded-full mb-2">
                  {data.category}
                </span>
              </div>
            </div>
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <span className="font-medium text-primary">{sourceLabel}</span>
                <span>•</span>
                <span>{formatTimeAgo(data.publishedAt)}</span>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-primary transition-colors">
                {data.headline}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-base mb-4 line-clamp-3">
                {data.summary}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {readTime} min read
                </span>
                {hasMultipleSources && (
                  <span className="flex items-center gap-1 text-primary">
                    <span className="text-xs">View all perspectives</span>
                    <ExternalLink className="h-3 w-3" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <article className="group flex gap-4 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition-all duration-300">
        <Link
          href={`/article/${encodeURIComponent(data.primaryArticle.url)}`}
          className="flex gap-4 flex-1 p-4"
        >
          <div className="relative w-32 h-24 md:w-40 md:h-28 shrink-0 rounded-lg overflow-hidden">
            <Image
              src={data.imageUrl}
              alt={data.headline}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="160px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span className="font-medium text-primary">{data.category}</span>
              <span>•</span>
              <span>{sourceLabel}</span>
            </div>
            <h3 className="font-serif text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-primary transition-colors">
              {data.headline}
            </h3>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>{formatTimeAgo(data.publishedAt)}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {readTime} min
              </span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group">
        <Link
          href={`/article/${encodeURIComponent(data.primaryArticle.url)}`}
          className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
        >
          <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden">
            <Image
              src={data.imageUrl}
              alt={data.headline}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
              {data.headline}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{sourceLabel}</span>
              <span>•</span>
              <span>{formatTimeAgo(data.publishedAt)}</span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  // Default card
  return (
    <article className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 news-card">
      <Link
        href={`/article/${encodeURIComponent(data.primaryArticle.url)}`}
        className="block"
      >
        <div className="relative h-48 overflow-hidden image-zoom">
          <Image
            src={data.imageUrl}
            alt={data.headline}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-3 left-3">
            <span className="inline-block px-2 py-1 bg-accent/90 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider rounded">
              {data.category}
            </span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span className="font-medium text-primary">{sourceLabel}</span>
            {hasMultipleSources && (
              <span className="inline-flex items-center px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs">
                +{data.sources.length - 1} more
              </span>
            )}
          </div>
          <h3 className="font-serif text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {data.headline}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
            {truncateText(data.summary, 120)}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-3">
              <span>{formatTimeAgo(data.publishedAt)}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {readTime} min
              </span>
            </div>
            {data.countries.length > 0 && (
              <span
                className="text-base"
                title={`Countries: ${data.countries.join(", ")}`}
              >
                {data.countries
                  .slice(0, 2)
                  .map((c) => getFlagEmoji(c))
                  .join(" ")}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
