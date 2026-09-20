// About skeleton.
//
// The page is `force-dynamic` and reads the profile row on every request, so
// there is always a wait here. It used to be covered by staggered slide-ins on
// the hero, the body and the stack, which is a different thing from a loading
// state: the content arrived and then performed. This mirrors the real page
// instead, in the same containers and at the same widths, so the hand-off to
// real content does not move anything.
//
//   ProfileHero   work-breakout, max-w-[36rem], no aside on this page
//   Body          work-breakout, max-w-[38.75rem], the experience timeline
//   TechStack     work-breakout, top rule, label column + logo row, two
//                 group-columns from lg
const ROLES = ["r1", "r2", "r3"];
const STACK_GROUPS = ["g1", "g2", "g3", "g4", "g5", "g6", "g7"];
const DOTS = ["d1", "d2", "d3", "d4", "d5"];

const Bar = ({ className }: { className: string }) => (
  <div className={`skeleton ${className}`} />
);

export default function AboutLoading() {
  return (
    <div className="pb-16 md:pb-24" aria-hidden>
      {/* ---- ProfileHero ---- */}
      <section className="work-breakout pt-12 pb-8 sm:pt-14 md:pb-10 md:pt-16">
        <div className="max-w-[36rem]">
          <div className="flex flex-col items-start gap-4 sm:gap-5">
            <div className="skeleton h-20 w-20 shrink-0 rounded-full sm:h-24 sm:w-24 md:h-28 md:w-28" />
            <div>
              <Bar className="h-8 w-56 sm:h-9 sm:w-64 md:h-[2.3rem] md:w-72" />
              {/* The role line under the name. */}
              <Bar className="mt-2 h-6 w-44 md:h-7 md:w-52" />
            </div>
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

      {/* ---- Body: the experience timeline ---- */}
      <section className="work-breakout mt-14 md:mt-16">
        <div className="max-w-[38.75rem]">
          {/* my-10 on the timeline itself, which the real widget carries. */}
          <div className="my-10 flex gap-4">
            <Bar className="h-11 w-11 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <Bar className="h-6 w-40" />
              <Bar className="mt-1 h-4 w-52" />
              {/* The roles, indented under the company behind its spine. */}
              <div className="mt-5 ml-1 space-y-6 border-l border-md-outline-variant">
                {ROLES.map((r, i) => (
                  <div key={r} className="pl-5">
                    <Bar className="h-6 w-56" />
                    <Bar className="mt-1 h-4 w-64" />
                    <div className="mt-3 space-y-2">
                      {DOTS.slice(0, i === 0 ? 5 : 2).map((d) => (
                        <Bar key={d} className="h-5 w-[94%]" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- What I build with ---- */}
      <section className="work-breakout mt-14 border-t border-md-outline-variant pt-8 md:mt-16">
        <Bar className="mb-5 h-5 w-40" />
        <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-[max-content_1fr] sm:gap-y-5 lg:grid-cols-[max-content_1fr_max-content_1fr] lg:gap-x-10 lg:gap-y-6">
          {STACK_GROUPS.map((g, i) => (
            <div key={g} className="contents">
              <div className="-mb-2 sm:mb-0 sm:pt-[0.5rem]">
                <Bar className="h-4 w-24" />
              </div>
              <div className="flex flex-wrap gap-2">
                {DOTS.slice(0, 3 + (i % 3)).map((d) => (
                  <Bar key={d} className="h-8 w-8 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
