import type { ExperienceCompany, ExperienceRole } from "@/db/schema";
import {
  fmtDuration,
  fmtMonth,
  januaryIndex,
  monthIndex,
  monthsInclusive,
  nowIndex,
} from "@/lib/experience-time";
import Image from "next/image";
import Link from "next/link";

/**
 * The career and the education on one year axis: work down the left, school
 * down the right, every block as tall as the span it covers.
 *
 * Two tracks means the blocks are placed, not stacked -- a degree and a job
 * run at the same time, and a flow layout cannot put two things at the same
 * y. So each block is positioned from its own dates against a shared ruler,
 * which is also what makes the two sides comparable at a glance.
 *
 * The consequence, and the reason the blocks are terse: a placed block cannot
 * push the next one down, so anything that does not fit would overlap. Every
 * block therefore carries only what fits in the shortest span on the chart --
 * a title, the organisation, and the dates. The result lines live under the
 * chart instead, where they can be as long as they need to be.
 *
 * Heights and positions both come from the same month arithmetic, so a block
 * that looks twice as tall as another covers twice the time.
 */

// The months-to-pixels scale lives in the stylesheet, as --exp-scale, because
// it has to change with the width and breakpoints belong in CSS. This file
// emits unitless month counts and lets the stylesheet multiply.
//
// The floor is the shortest span on the chart, because a block that cannot
// fit its own text would be clipped by its neighbour. The shortest here is a
// 5-month role. Wide, that block is 376px across, its title sits on one line,
// and 92px is enough: 1.25rem a month clears it. Narrow, the same title wraps
// to two lines and wants about 104px, so the scale steps up to 1.75rem below
// 1024px, which is also where the block stops getting the wider measure.
//
// The ceiling is the page. The axis runs Sep 2020 to Jun 2027 once education
// is on it -- 81 months, against the 25 that work alone spanned -- so every
// extra pixel a month costs 81 of them. That is why the blocks lost their
// result lines when school arrived: at the 3rem a month this chart used when
// it held work only, it would now be 3,900px tall.

const TONES = [
  {
    block: "bg-md-primary-container border-transparent",
    ink: "hsl(var(--md-sys-color-on-primary-container))",
    muted: "hsl(var(--md-sys-color-on-primary-container) / 0.78)",
    bullet: "hsl(var(--md-sys-color-on-primary-container) / 0.45)",
  },
  {
    block: "bg-md-surface-container-high border-md-outline-variant",
    ink: "hsl(var(--md-sys-color-on-surface))",
    muted: "hsl(var(--md-sys-color-on-surface-variant))",
    bullet: "hsl(var(--md-sys-color-outline))",
  },
  {
    block: "bg-md-surface-container border-md-outline-variant",
    ink: "hsl(var(--md-sys-color-on-surface))",
    muted: "hsl(var(--md-sys-color-on-surface-variant))",
    bullet: "hsl(var(--md-sys-color-outline))",
  },
  {
    block: "bg-md-surface-container-low border-md-outline-variant",
    ink: "hsl(var(--md-sys-color-on-surface))",
    muted: "hsl(var(--md-sys-color-on-surface-variant))",
    bullet: "hsl(var(--md-sys-color-outline))",
  },
];

type Track = "work" | "education";

type Entry = {
  role: ExperienceRole;
  org: ExperienceCompany;
  track: Track;
  from: number;
  to: number;
  tone: number;
  showMark: boolean;
};

function Mark({ org }: { org: ExperienceCompany }) {
  if (!org.logo) return null;
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-md-outline-variant bg-md-surface">
      <Image
        src={org.logo}
        alt=""
        width={28}
        height={28}
        className="h-4 w-4 object-contain"
      />
    </span>
  );
}

function Block({
  entry,
  now,
  showSlot,
}: {
  entry: Entry;
  now: Date;
  showSlot: boolean;
}) {
  const { role, org, tone, showMark } = entry;
  const t = TONES[tone];
  const period = `${fmtMonth(role.start)} - ${
    role.end ? fmtMonth(role.end) : "Present"
  }`;
  const length = fmtDuration(monthsInclusive(role.start, role.end, now));

  return (
    // The mark sits outside the text column rather than inside the first row
    // of it, so the title, the note and the dates share one left edge. When
    // the mark was in the header row, the title was indented past it and the
    // two lines below it were not: three lines, two edges, in a block 376px
    // wide.
    <article
      className={`flex h-full gap-2 overflow-hidden rounded-xl border p-3 ${t.block}`}
      style={
        {
          "--chart-ink": t.ink,
          "--chart-ink-muted": t.muted,
          "--chart-bullet": t.bullet,
        } as React.CSSProperties
      }
    >
      {/* Reserved only when something in this track has a mark, so a track of
          schools with no logos is not indented past an empty square. Within a
          track that does have one, the slot is held for the rows that repeat
          an organisation. */}
      {showSlot && (
        <div className="h-7 w-7 shrink-0">{showMark && <Mark org={org} />}</div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 flex-col">
          <h3 className="text-[0.9375rem] font-medium leading-5">
            {role.title}
          </h3>
          <p className="chart-muted text-[0.8125rem] leading-4">
            <a
              href={org.url}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline hover:underline"
            >
              {org.company}
            </a>
          </p>
        </div>

        {role.note && (
          <p className="chart-muted text-[0.75rem] leading-4">{role.note}</p>
        )}

        {/* The span sits on the bottom edge. A block drawn to time is mostly
            empty when a long span has little to say about itself, and an
            open-bottomed void reads as something missing; closed by its own
            end date, the same space reads as the duration it is. */}
        <div className="flex-1" />
        <p className="chart-muted text-[0.75rem] leading-4 tabular-nums">
          {period}
          <span className="mx-1 opacity-60">&middot;</span>
          {length}
        </p>
      </div>
    </article>
  );
}

export default function ExperienceChart({
  companies,
}: {
  companies: ExperienceCompany[];
}) {
  // One clock for the whole render, so two durations on the same page cannot
  // disagree because the month turned over between them.
  const now = new Date();
  const today = nowIndex(now);

  const usable = companies
    .flatMap((org) =>
      org.roles.map((role) => ({
        role,
        org,
        track: (org.kind === "education" ? "education" : "work") as Track,
        from: monthIndex(role.start),
        to: role.end ? monthIndex(role.end) : today,
      })),
    )
    .filter((e) => Number.isFinite(e.from) && Number.isFinite(e.to))
    .sort((a, b) => b.to - a.to || b.from - a.from);

  if (!usable.length) return null;

  // Tone by recency within each track, so the newest job and the newest
  // qualification are each the strongest thing on their own side.
  const rank: Record<Track, number> = { work: 0, education: 0 };
  const lastOrg: Record<Track, string | null> = { work: null, education: null };
  const entries: Entry[] = usable.map((e) => {
    const tone = Math.min(rank[e.track]++, TONES.length - 1);
    const showMark = lastOrg[e.track] !== e.org.company;
    lastOrg[e.track] = e.org.company;
    return { ...e, tone, showMark };
  });

  const top = Math.max(...entries.map((e) => e.to));
  const bottom = Math.min(...entries.map((e) => e.from));
  const span = Math.max(top - bottom, 1);
  const offset = (idx: number) => top - idx;

  const years: number[] = [];
  for (let y = Math.ceil(bottom / 12); januaryIndex(y) <= top; y++) {
    if (januaryIndex(y) > bottom) years.push(y);
  }

  const hasEducation = entries.some((e) => e.track === "education");
  const trackHasMark: Record<Track, boolean> = {
    work: entries.some((e) => e.track === "work" && e.org.logo),
    education: entries.some((e) => e.track === "education" && e.org.logo),
  };
  const withResults = entries.filter(
    (e) => e.track === "work" && e.role.highlights?.length,
  );

  return (
    // exp-timeline carries the rule that strips list markers inside
    // .article-content, which the results list below still needs.
    <div className="exp-timeline exp-chart my-10">
      <div
        className={`exp-chart__plot relative ${
          hasEducation ? "" : "exp-chart__plot--single"
        }`}
        style={{ "--exp-months": span } as React.CSSProperties}
      >
        <div className="exp-chart__axis absolute top-0 bottom-0 w-px bg-md-outline-variant" />
        {years.map((y) => (
          <span
            key={y}
            className="exp-chart__year absolute -translate-y-1/2 rounded-full bg-md-surface px-1.5 text-[0.75rem] leading-4 tabular-nums text-md-on-surface-variant"
            style={
              { "--exp-top": offset(januaryIndex(y)) } as React.CSSProperties
            }
          >
            {y}
          </span>
        ))}

        {entries.map((e) => (
          <div
            key={`${e.track}-${e.org.company}-${e.role.title}`}
            className={`exp-chart__item exp-chart__item--${e.track} absolute`}
            style={
              {
                "--exp-top": offset(e.to),
                "--exp-span": Math.max(e.to - e.from, 1),
              } as React.CSSProperties
            }
          >
            <div className="h-full pb-2">
              <Block entry={e} now={now} showSlot={trackHasMark[e.track]} />
            </div>
          </div>
        ))}
      </div>

      {/* The chart says when and for how long; this says what came of it. It
          sits outside the plot because a placed block cannot grow and these
          lines need to. */}
      {withResults.length > 0 && (
        <div className="mt-10 flex flex-col gap-6">
          {withResults.map((e) => (
            <div key={`${e.org.company}-${e.role.title}`}>
              <h3 className="text-[0.9375rem] font-medium leading-6 text-md-on-surface">
                {e.role.title}
              </h3>
              <ul className="mt-2 flex flex-col gap-2">
                {(e.role.highlights ?? []).map((h) => (
                  <li
                    key={h.text}
                    className="relative ml-0 pl-4 text-[0.875rem] leading-6 text-md-on-surface-variant before:absolute before:left-0 before:top-[0.6875rem] before:h-[3px] before:w-[3px] before:rounded-full before:bg-md-outline"
                  >
                    {h.text}
                    {h.proof && (
                      <>
                        {" "}
                        <Link
                          href={`/work/${h.proof.slug}`}
                          className="whitespace-nowrap font-medium text-primary underline decoration-1 underline-offset-2"
                        >
                          {h.proof.label}
                        </Link>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
