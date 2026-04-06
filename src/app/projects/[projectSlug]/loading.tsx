export default function ProjectLoading() {
  return (
    <div className="py-8 sm:py-12 md:py-16">
      <div className="h-4 w-32 bg-muted animate-pulse mb-8" />

      <div className="mb-8 sm:mb-10">
        <div className="h-8 w-2/3 bg-muted animate-pulse mb-3" />
        <div className="flex items-center gap-4">
          <div className="h-4 w-28 bg-muted animate-pulse" />
          <div className="h-4 w-36 bg-muted animate-pulse" />
        </div>
      </div>

      <div className="space-y-3 mb-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-muted animate-pulse"
            style={{ width: `${55 + ((i * 17) % 40)}%` }}
          />
        ))}
      </div>

      <div className="pt-8 border-t border-border">
        <div className="h-3 w-40 bg-muted animate-pulse mb-6" />
        <div className="space-y-2 md:space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-baseline gap-4 py-1.5 md:py-2"
            >
              <div className="h-3 w-24 bg-muted animate-pulse shrink-0" />
              <div
                className="h-4 bg-muted animate-pulse"
                style={{ width: `${40 + i * 15}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
