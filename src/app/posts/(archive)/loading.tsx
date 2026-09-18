// Archive skeleton.
//
// The page is a sticky aside in col-1 and the feed in col-2, inside
// work-breakout, and every row is the date label over a title that FeedRow
// renders, 40px apart with no rules between them. The previous version drew a full-width stack of year groups
// with no aside at all, so the real page arrived as a two-column layout on top
// of a one-column placeholder.
const ROWS = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9", "r10"];

const Bar = ({ className }: { className: string }) => (
  <div className={`skeleton ${className}`} />
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

        <div className="col-2 flex flex-col gap-12">
          {ROWS.map((id, i) => (
            <div key={id} className="max-w-[40rem]">
              <Bar className="h-3 w-[4.5rem]" />
              {/* Deterministic widths so the placeholder does not shimmer into
                  a different shape on every render. */}
              <div
                className="skeleton mt-2 h-[1.625rem]"
                style={{ width: `${68 + ((i * 13) % 26)}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
