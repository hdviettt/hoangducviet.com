// Skeleton for the post-detail route. Mirrors the real PostDetail anatomy
// (centered meta → title → byline, full-width cover hero, centered standfirst,
// centered prose column — no sidebar) so the hand-off to real content doesn't
// visibly shift the layout.
// Explicit, stable keys + widths so the decorative bars vary naturally without
// keying React nodes on their array index.
const PROSE_A = [
  { id: "a1", w: 92 },
  { id: "a2", w: 78 },
  { id: "a3", w: 85 },
  { id: "a4", w: 70 },
  { id: "a5", w: 88 },
  { id: "a6", w: 74 },
  { id: "a7", w: 90 },
  { id: "a8", w: 66 },
  { id: "a9", w: 82 },
  { id: "a10", w: 54 },
];
const PROSE_B = [
  { id: "b1", w: 84 },
  { id: "b2", w: 72 },
  { id: "b3", w: 89 },
  { id: "b4", w: 68 },
  { id: "b5", w: 80 },
  { id: "b6", w: 62 },
  { id: "b7", w: 76 },
];

export default function PostLoading() {
  return (
    <div className="pt-12 sm:pt-16 md:pt-20 pb-24" aria-hidden>
      {/* centered header: meta row → title → byline */}
      <div className="mx-auto max-w-[880px] text-center mb-10 md:mb-14">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-5 md:mb-7">
          <div className="h-4 w-28 bg-muted animate-pulse rounded" />
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 sm:h-11 md:h-[52px] w-[86%] bg-muted animate-pulse rounded-lg" />
          <div className="h-9 sm:h-11 md:h-[52px] w-[54%] bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="h-4 w-32 bg-muted animate-pulse rounded mx-auto mt-6 md:mt-8" />
      </div>

      {/* centered standfirst */}
      <div className="mx-auto max-w-[720px] mb-12 md:mb-16 flex flex-col items-center gap-3">
        <div className="h-5 w-[90%] bg-muted animate-pulse rounded" />
        <div className="h-5 w-[82%] bg-muted animate-pulse rounded" />
        <div className="h-5 w-[46%] bg-muted animate-pulse rounded" />
      </div>

      {/* centered prose column */}
      <div className="mx-auto max-w-[720px] space-y-3">
        {PROSE_A.map((line) => (
          <div
            key={line.id}
            className="h-4 bg-muted animate-pulse rounded"
            style={{ width: `${line.w}%` }}
          />
        ))}
        <div className="h-6" />
        {PROSE_B.map((line) => (
          <div
            key={line.id}
            className="h-4 bg-muted animate-pulse rounded"
            style={{ width: `${line.w}%` }}
          />
        ))}
      </div>
    </div>
  );
}
