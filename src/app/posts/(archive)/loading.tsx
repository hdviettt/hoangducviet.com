// Archive skeleton.
//
// The page is a sticky aside in col-1 and the feed in col-2, inside
// work-breakout, and every row is the same 92px date column plus title that
// FeedRow renders. The previous version drew a full-width stack of year groups
// with no aside at all, so the real page arrived as a two-column layout on top
// of a one-column placeholder.
const ROWS = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9", "r10"];

const Bar = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded bg-muted ${className}`} />
);

export default function PostsLoading() {
  return (
    <section
      className="work-breakout pb-16 pt-12 sm:pt-16 md:pb-20 md:pt-20"
      aria-hidden
    >
      <div className="site-grid">
        <aside className="col-1 mb-9 md:mb-0">
          <Bar className="h-7 w-28" />
          <div className="mt-7 hidden flex-col gap-2 lg:flex">
            <Bar className="h-4 w-10" />
            <Bar className="h-4 w-10" />
          </div>
        </aside>

        <div className="col-2">
          {ROWS.map((id, i) => (
            <div
              key={id}
              className="grid grid-cols-1 gap-y-1.5 border-b border-md-outline-variant py-[1.3125rem] sm:grid-cols-[92px_1fr] sm:gap-x-6"
            >
              <Bar className="h-4 w-20 sm:mt-[0.1875rem]" />
              {/* Deterministic widths so the placeholder does not shimmer into
                  a different shape on every render. */}
              <div
                className="h-5 animate-pulse rounded bg-muted"
                style={{ width: `${68 + ((i * 13) % 26)}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
