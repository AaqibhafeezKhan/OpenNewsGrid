'use client';

import Link from 'next/link';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { NewsArticle } from '@/types';
import { formatTimeAgo } from '@/lib/utils';

interface BreakingNewsProps {
  articles: NewsArticle[];
}

export function BreakingNews({ articles }: BreakingNewsProps) {
  if (articles.length === 0) return null;

  return (
    <div className="bg-breaking text-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-10 gap-4">
          {/* Label */}
          <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider shrink-0">
            <AlertCircle className="h-4 w-4 animate-pulse" />
            Breaking
          </div>
          
          {/* Ticker */}
          <div className="flex-1 overflow-hidden relative">
            <div className="flex gap-8 animate-ticker whitespace-nowrap">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/article/${encodeURIComponent(article.url)}`}
                  className="flex items-center gap-2 hover:underline shrink-0"
                >
                  <span className="text-sm truncate max-w-md">
                    {article.title}
                  </span>
                  <span className="text-xs text-white/70">
                    {formatTimeAgo(article.publishedAt)}
                  </span>
                  <ChevronRight className="h-3 w-3 text-white/50" />
                </Link>
              ))}
              {/* Duplicate for seamless loop */}
              {articles.map((article) => (
                <Link
                  key={`dup-${article.id}`}
                  href={`/article/${encodeURIComponent(article.url)}`}
                  className="flex items-center gap-2 hover:underline shrink-0"
                >
                  <span className="text-sm truncate max-w-md">
                    {article.title}
                  </span>
                  <span className="text-xs text-white/70">
                    {formatTimeAgo(article.publishedAt)}
                  </span>
                  <ChevronRight className="h-3 w-3 text-white/50" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
