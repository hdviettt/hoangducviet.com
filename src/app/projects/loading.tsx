export default function ProjectsLoading() {
  return (
    <div className="py-8 sm:py-12 md:py-16">
      <div className="h-8 w-32 bg-muted animate-pulse mb-8 sm:mb-10 md:mb-12" />

      <div className="flex flex-wrap gap-2 mb-8 md:mb-10">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-8 w-20 bg-muted animate-pulse border border-border"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border border-border bg-background overflow-hidden"
          >
            <div className="p-5 md:p-6 flex flex-col gap-3">
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-muted animate-pulse" />
                <div className="h-3 w-10 bg-muted animate-pulse" />
              </div>
              <div className="h-6 w-3/4 bg-muted animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-3 w-full bg-muted animate-pulse" />
                <div className="h-3 w-2/3 bg-muted animate-pulse" />
              </div>
            </div>
            <div className="aspect-video bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
