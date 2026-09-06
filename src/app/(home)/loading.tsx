// Homepage skeleton. Mirrors ProfileHero (photo + name + badge + bio + socials)
// and the "Writing" feed (two-column rows with 16/9 thumbnails) so the hand-off
// to real content doesn't shift the layout.
const FEED_CELLS = ["c1", "c2", "c3", "c4"];

export default function HomeLoading() {
  return (
    <div className="pb-16 md:pb-20" aria-hidden>
      {/* ProfileHero */}
      <section className="pt-10 sm:pt-12 md:pt-16 pb-10 md:pb-14">
        <div className="max-w-[640px] mx-auto">
          <div className="flex flex-col items-center gap-4 sm:gap-5 mb-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="h-7 sm:h-9 md:h-10 w-48 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="space-y-3 flex flex-col items-center">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-11/12 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4/5 bg-muted animate-pulse rounded" />
          </div>
          <div className="mt-6 flex justify-center items-center gap-5">
            <div className="w-5 h-5 rounded-full bg-muted animate-pulse" />
            <div className="w-5 h-5 rounded-full bg-muted animate-pulse" />
            <div className="w-5 h-5 rounded-full bg-muted animate-pulse" />
            <div className="w-5 h-5 rounded-full bg-muted animate-pulse" />
            <span className="w-px h-4 bg-md-outline-variant" />
            <div className="h-4 w-56 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </section>

      {/* Writing feed */}
      <section className="mt-4 md:mt-8">
        <div className="h-10 md:h-14 w-40 md:w-52 bg-muted animate-pulse rounded-lg" />
        <div className="mt-3 space-y-2 max-w-[820px]">
          <div className="h-6 md:h-8 w-full bg-muted animate-pulse rounded" />
          <div className="h-6 md:h-8 w-3/5 bg-muted animate-pulse rounded" />
        </div>

        <div className="mt-10 md:mt-16 grid md:grid-cols-2 gap-x-16 xl:gap-x-20">
          {FEED_CELLS.map((id) => (
            <div
              key={id}
              className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-8 py-8 md:py-10 border-b border-md-outline-variant"
            >
              <div className="min-w-0 flex-1">
                <div className="h-6 md:h-7 w-11/12 bg-muted animate-pulse rounded mb-2" />
                <div className="h-6 md:h-7 w-2/3 bg-muted animate-pulse rounded" />
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
                </div>
                <div className="mt-4 h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
