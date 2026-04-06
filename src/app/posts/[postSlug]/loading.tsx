export default function PostLoading() {
  return (
    <div className="py-8 sm:py-12 md:py-16">
      <div className="h-4 w-20 bg-muted animate-pulse mb-8" />

      <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-12 items-start">
        <div className="min-w-0">
          <div className="mb-10 sm:mb-12">
            <div className="h-10 w-3/4 bg-muted animate-pulse mb-4" />
            <div className="h-4 w-32 bg-muted animate-pulse" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-4 bg-muted animate-pulse"
                style={{ width: `${60 + ((i * 13) % 40)}%` }}
              />
            ))}
            <div className="h-6" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`p2-${i}`}
                className="h-4 bg-muted animate-pulse"
                style={{ width: `${55 + ((i * 19) % 40)}%` }}
              />
            ))}
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-3 bg-muted animate-pulse"
                style={{ width: `${60 + ((i * 10) % 40)}%` }}
              />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
