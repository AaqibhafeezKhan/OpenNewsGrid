export function NewsCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'horizontal' | 'compact' | 'featured' }) {
  if (variant === 'featured') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="h-64 md:h-full min-h-[300px] skeleton" />
          <div className="p-6 md:p-8 space-y-4">
            <div className="h-4 w-20 skeleton rounded" />
            <div className="h-8 w-full skeleton rounded" />
            <div className="h-8 w-3/4 skeleton rounded" />
            <div className="h-4 w-full skeleton rounded" />
            <div className="h-4 w-full skeleton rounded" />
            <div className="h-4 w-2/3 skeleton rounded" />
            <div className="flex gap-4 pt-2">
              <div className="h-3 w-16 skeleton rounded" />
              <div className="h-3 w-20 skeleton rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className="flex gap-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <div className="w-32 h-24 md:w-40 md:h-28 shrink-0 skeleton rounded-lg" />
        <div className="flex-1 space-y-3">
          <div className="h-3 w-24 skeleton rounded" />
          <div className="h-5 w-full skeleton rounded" />
          <div className="h-5 w-3/4 skeleton rounded" />
          <div className="flex gap-3 pt-1">
            <div className="h-3 w-16 skeleton rounded" />
            <div className="h-3 w-12 skeleton rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="w-16 h-16 shrink-0 skeleton rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-full skeleton rounded" />
          <div className="h-4 w-3/4 skeleton rounded" />
          <div className="h-3 w-24 skeleton rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow">
      <div className="h-48 skeleton" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-3 w-20 skeleton rounded" />
          <div className="h-3 w-16 skeleton rounded" />
        </div>
        <div className="h-5 w-full skeleton rounded" />
        <div className="h-5 w-3/4 skeleton rounded" />
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-4 w-2/3 skeleton rounded" />
        <div className="flex justify-between pt-2">
          <div className="h-3 w-20 skeleton rounded" />
          <div className="h-3 w-16 skeleton rounded" />
        </div>
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="h-80 md:h-96 skeleton" />
      <div className="p-6 md:p-8 space-y-4">
        <div className="flex gap-2">
          <div className="h-5 w-24 skeleton rounded-full" />
          <div className="h-5 w-32 skeleton rounded-full" />
        </div>
        <div className="h-10 w-full skeleton rounded" />
        <div className="h-10 w-2/3 skeleton rounded" />
        <div className="h-5 w-full skeleton rounded" />
        <div className="h-5 w-full skeleton rounded" />
        <div className="h-5 w-3/4 skeleton rounded" />
        <div className="flex gap-4 pt-2">
          <div className="h-4 w-24 skeleton rounded" />
          <div className="h-4 w-32 skeleton rounded" />
        </div>
      </div>
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="h-6 w-32 skeleton rounded" />
      <div className="h-12 w-full skeleton rounded" />
      <div className="h-12 w-3/4 skeleton rounded" />
      <div className="flex gap-4">
        <div className="h-4 w-32 skeleton rounded" />
        <div className="h-4 w-24 skeleton rounded" />
      </div>
      <div className="h-64 md:h-96 skeleton rounded-xl" />
      <div className="space-y-3">
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-4 w-5/6 skeleton rounded" />
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-4 w-4/5 skeleton rounded" />
      </div>
    </div>
  );
}
