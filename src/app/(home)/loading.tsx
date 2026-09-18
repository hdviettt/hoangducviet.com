// Homepage skeleton.
//
// It mirrors what the page actually renders, in the same containers and at the
// same widths, so the hand-off to real content does not move anything:
//
//   ProfileHero   work-breakout, max-w-[36rem], LEFT aligned
//   WorkLead      "Selected work", then three site-grid blocks separated by
//                 rules, text in col-1 and the clip in col-2
//   Articles      work-breakout, site-grid, sticky aside in col-1 and the feed
//                 in col-2, where every item is a cover card
//
// The previous version centred the hero and skipped the work section entirely,
// which is what made the load flash from a centred column to a left-aligned
// page with three large blocks in it.
const WORK_BLOCKS = ["w1", "w2", "w3"];
const FEED_ROWS = ["f1", "f2", "f3", "f4", "f5", "f6"];
const STACK_DOTS = ["s1", "s2", "s3", "s4", "s5"];

const Bar = ({ className }: { className: string }) => (
  <div className={`skeleton ${className}`} />
);

export default function HomeLoading() {
  return (
    <div className="pb-16" aria-hidden>
      {/* ---- ProfileHero ---- */}
      <section className="work-breakout pt-12 pb-8 sm:pt-14 md:pb-10 md:pt-16">
        <div className="max-w-[36rem]">
          <div className="flex flex-col items-start gap-4 sm:gap-5">
            <div className="skeleton h-20 w-20 shrink-0 rounded-full sm:h-24 sm:w-24 md:h-28 md:w-28" />
            <Bar className="h-8 w-56 sm:h-9 sm:w-64 md:h-[2.3rem] md:w-72" />
          </div>
          <div className="mt-5 space-y-3">
            <Bar className="h-4 w-full" />
            <Bar className="h-4 w-[97%]" />
            <Bar className="h-4 w-[92%]" />
            <Bar className="h-4 w-2/3" />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Bar className="h-5 w-5 rounded-full" />
            <Bar className="h-5 w-5 rounded-full" />
            <Bar className="h-5 w-5 rounded-full" />
            <Bar className="h-5 w-5 rounded-full" />
            <span className="hidden h-4 w-px bg-md-outline-variant sm:block" />
            <Bar className="h-4 w-48" />
          </div>
        </div>
      </section>

      {/* ---- Selected work ---- */}
      <div className="mt-10 md:mt-14">
        <div className="work-breakout">
          <Bar className="h-7 w-44" />
        </div>

        <div className="work-breakout mt-9 flex flex-col md:mt-12">
          {WORK_BLOCKS.map((id) => (
            <div
              key={id}
              className="border-t border-md-outline-variant py-14 first:border-t-0 first:pt-0 md:py-20"
            >
              <div className="site-grid items-start">
                <div className="col-1">
                  <div className="flex gap-2">
                    <Bar className="h-7 w-12 rounded-full" />
                    <Bar className="h-7 w-16 rounded-full" />
                  </div>
                  <div className="mt-5 space-y-2.5">
                    <Bar className="h-7 w-11/12 md:h-8" />
                    <Bar className="h-7 w-3/4 md:h-8" />
                  </div>
                  <div className="mt-5 space-y-2.5">
                    <Bar className="h-4 w-full" />
                    <Bar className="h-4 w-[95%]" />
                    <Bar className="h-4 w-4/5" />
                  </div>
                  <div className="mt-7 flex items-center gap-3">
                    <Bar className="h-4 w-14" />
                    {STACK_DOTS.slice(0, 4).map((d) => (
                      <Bar key={d} className="h-8 w-8 rounded-full" />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Bar className="h-4 w-16" />
                    {STACK_DOTS.map((d) => (
                      <Bar key={d} className="h-8 w-8 rounded-full" />
                    ))}
                  </div>
                  <Bar className="mt-8 h-11 w-40 rounded-full" />
                </div>
                <div className="col-2">
                  <Bar className="aspect-[16/9] w-full rounded-xl" />
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-5 md:gap-8">
            <span className="h-px flex-1 bg-md-outline-variant" />
            <Bar className="h-11 w-36 shrink-0 rounded-full" />
          </div>
        </div>
      </div>

      {/* ---- Articles ---- */}
      <section className="work-breakout mt-16 md:mt-24">
        <div className="site-grid">
          <aside className="col-1 mb-9 md:mb-0">
            <Bar className="h-7 w-28" />
            <div className="mt-7 hidden flex-col gap-2 lg:flex">
              <Bar className="h-4 w-10" />
              <Bar className="h-4 w-10" />
            </div>
          </aside>
          {/* The feed is a whitespace list now: a date label over a title, 40px
              between items, no rules. The placeholder has to be the same shape
              or the hand-off moves the page, which is the whole reason this
              file mirrors the real layout instead of drawing generic boxes. */}
          <div className="col-2">
            {/* Cards, matching FeedRow: a 1200x630 cover with a panel of date,
                title and description under it, spaced by `.fw-list`. Two text
                bars here drew about a third of the real height, so the page
                jumped when the feed arrived. */}
            <div className="fw-list flex flex-col">
              {FEED_ROWS.map((id, i) => (
                <div key={id}>
                  <div className="skeleton aspect-[1200/630] w-full rounded-[var(--md-sys-shape-corner-extra-large)]" />
                  <div className="mt-4 rounded-[var(--md-sys-shape-corner-extra-large)] bg-md-surface-container-low p-7">
                    <Bar className="h-3 w-[4.5rem]" />
                    <div
                      className="skeleton mt-3 h-[1.75rem]"
                      style={{ width: `${62 + ((i * 11) % 24)}%` }}
                    />
                    <Bar className="mt-4 h-3 w-full" />
                    <Bar className="mt-2 h-3 w-[80%]" />
                  </div>
                </div>
              ))}
            </div>
            <Bar className="mt-10 h-5 w-28" />
          </div>
        </div>
      </section>
    </div>
  );
}
