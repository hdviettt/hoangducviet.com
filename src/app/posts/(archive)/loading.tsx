// Archive skeleton.
//
// The page is a sticky aside in col-1 and the feed in col-2, inside
// work-breakout. The feed is cards now -- a 1200x630 cover with a panel of
// date, title and description under it -- so this mirrors that shape and its
// `.fw-list` spacing. Drawing the old two-bar text row here meant the
// placeholder was about a third of the real height and the page jumped the
// moment the feed arrived.
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

        <div className="col-2 fw-list flex flex-col">
          {ROWS.map((id, i) => (
            <div key={id}>
              {/* The cover, at the ratio every cover has: 1200x630. It is the
                  tallest part of a card by far, so a placeholder that skips it
                  collapses to a third of the height and the page jumps when
                  the real feed lands. */}
              <div className="skeleton aspect-[1200/630] w-full rounded-[var(--md-sys-shape-corner-extra-large)]" />
              <div className="mt-4 rounded-[var(--md-sys-shape-corner-extra-large)] bg-md-surface-container-low p-7">
                <Bar className="h-3 w-[4.5rem]" />
                <div
                  className="skeleton mt-3 h-[1.75rem]"
                  style={{ width: `${60 + ((i * 13) % 26)}%` }}
                />
                <Bar className="mt-4 h-3 w-full" />
                <Bar className="mt-2 h-3 w-[82%]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
