export default function PostsLoading() {
  return (
    <div className="py-8 sm:py-12 md:py-16">
      <div className="h-8 w-24 bg-muted animate-pulse mb-8 sm:mb-10 md:mb-12" />

      {[1, 2].map((group) => (
        <div key={group} className="mb-10 sm:mb-12 md:mb-16">
          <div className="h-4 w-16 bg-muted animate-pulse mb-6 md:mb-8 pb-2 border-b border-border" />
          <div className="space-y-1 md:space-y-1.5">
            {Array.from({ length: group === 1 ? 4 : 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-baseline gap-4 py-1.5 md:py-2"
              >
                <div className="h-3 w-14 bg-muted animate-pulse shrink-0" />
                <div
                  className="h-4 bg-muted animate-pulse"
                  style={{ width: `${50 + ((i * 17) % 30)}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
