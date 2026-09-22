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
 * The career as a chart: a year axis, and a block per role whose height is the
 * time it took.
 *
 * The list version answers "what did he do". This answers "for how long, and
 * when", which is the question a list is bad at -- three roles set as three
 * equal rows say nothing about one lasting sixteen months and another six.
 *
 * Honesty rules, because a chart that lies is worse than a list:
 *
 *   A block is at least its tenure tall. It is allowed to be taller when its
 *   own text does not fit, and when that happens the year labels inside it
 *   stretch with it, because they are positioned as a percentage of the
 *   segment rather than in pixels. So the axis is piecewise linear: exact
 *   within every segment, and compressed only where text forced a segment
 *   open. It is never wrong about which side of a year a role falls on.
 *
 *   Gaps between roles are drawn at the same scale as the roles. A year out
 *   is a year of empty axis, not a missing row.
 */

// 3rem a month, and the number is measured, not picked.
//
// The scale has to clear the densest block, because a block that cannot fit
// its own text sets its own height and stops being drawn to time. Measured at
// this width, the tightest is the 5-month role carrying two result lines: its
// natural content is 219px, so a month has to be worth at least 46px.
//
// The walk to get here is worth recording, because most of it was chasing a
// bug rather than tuning a number. 1.625rem gave a 15-month role and a
// 5-month one a height ratio of 1.9 where the truth is 3.0; 2.5rem got 2.36;
// 3.5rem cleared it until the end date was pinned to the bottom edge; 4rem
// cleared that. Then the real cause turned up: the article's prose margins
// were leaking into the blocks and putting 123px into a header holding 44px
// of text. With that fixed the same content fits in 3rem, and the section is
// 1200px instead of 1673.
//
// The cost that remains is real: the scale is set by the densest block and
// paid by the longest, so a 15-month role is three times the height of a
// 5-month one whether or not it has three times as much to say. Pulling the
// result lines out of the blocks is the one lever that changes that.
const REM_PER_MONTH = 3;

// Newest first, so the tone steps down as the roles get older. Past the end of
// the ramp everything sits on the quietest step.
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

type Entry = {
  role: ExperienceRole;
  company: ExperienceCompany;
  from: number;
  to: number;
};

type Segment =
  | ({ kind: "role"; tone: number } & Entry)
  | { kind: "gap"; from: number; to: number };

function Logo({ company }: { company: ExperienceCompany }) {
  if (!company.logo) return null;
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-md-outline-variant bg-md-surface">
      <Image
        src={company.logo}
        alt=""
        width={36}
        height={36}
        className="h-5 w-5 object-contain"
      />
    </span>
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

  // Every role across every company on one axis. The data nests roles under a
  // company, but time does not: two companies are still one career, and the
  // chart has to put them on the same ruler.
  const entries: Entry[] = companies
    .flatMap((company) =>
      company.roles.map((role) => ({
        role,
        company,
        from: monthIndex(role.start),
        to: role.end ? monthIndex(role.end) : today,
      })),
    )
    .filter((e) => Number.isFinite(e.from) && Number.isFinite(e.to))
    .sort((a, b) => b.to - a.to || b.from - a.from);

  if (!entries.length) return null;

  // Roles, newest at the top, with any time between them drawn to scale.
  const segments: Segment[] = [];
  entries.forEach((entry, i) => {
    segments.push({
      kind: "role",
      tone: Math.min(i, TONES.length - 1),
      ...entry,
    });
    const next = entries[i + 1];
    if (next && entry.from > next.to) {
      segments.push({ kind: "gap", from: next.to, to: entry.from });
    }
  });

  // The company mark belongs to the company, not to each of its roles: three
  // roles at one employer drew the same logo three times.
  const firstOfCompany = new Set<string>();
  let seen: string | null = null;
  for (const e of entries) {
    if (e.company.company !== seen) {
      firstOfCompany.add(e.role.title);
      seen = e.company.company;
    }
  }

  return (
    // exp-timeline carries the rule that strips list markers inside
    // .article-content, which this still needs for the result lists.
    <div className="exp-timeline exp-chart my-10">
      {/* The newest edge of the axis, named. Without it the first year label
          can be most of a page down, and the top of the chart reads as
          undated. */}
      <div className="mb-2 flex gap-4">
        <span className="w-14 shrink-0 text-right text-[0.75rem] font-medium leading-4 tabular-nums text-md-on-surface">
          {entries[0].role.end ? fmtMonth(entries[0].role.end) : "Present"}
        </span>
        <span className="w-px shrink-0 bg-md-outline-variant" />
      </div>

      {segments.map((seg) => {
        const months = Math.max(seg.to - seg.from, 1);
        // Every January the axis crosses inside this segment. Positioned as a
        // percentage so the label stays on its date even if text has made the
        // segment taller than its tenure.
        const years: { year: number; pct: number }[] = [];
        for (let y = Math.ceil(seg.from / 12); januaryIndex(y) <= seg.to; y++) {
          const at = januaryIndex(y);
          if (at <= seg.from || at > seg.to) continue;
          years.push({ year: y, pct: ((seg.to - at) / months) * 100 });
        }

        const key =
          seg.kind === "role"
            ? `role-${seg.company.company}-${seg.role.title}`
            : `gap-${seg.from}-${seg.to}`;

        return (
          <div
            key={key}
            className="flex gap-4"
            style={{ minHeight: `${months * REM_PER_MONTH}rem` }}
          >
            {/* Year rail */}
            <div className="relative w-14 shrink-0">
              {years.map(({ year, pct }) => (
                <span
                  key={year}
                  className="absolute right-0 -translate-y-1/2 text-[0.75rem] leading-4 tabular-nums text-md-on-surface-variant"
                  style={{ top: `${pct}%` }}
                >
                  {year}
                </span>
              ))}
            </div>

            {/* The axis itself, one segment at a time. The pieces butt
                together, so it draws as a single rule. */}
            <div className="relative w-px shrink-0 bg-md-outline-variant">
              {years.map(({ year, pct }) => (
                <span
                  key={year}
                  aria-hidden="true"
                  className="absolute left-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-md-outline"
                  style={{ top: `${pct}%` }}
                />
              ))}
            </div>

            <div className="flex min-w-0 flex-1 flex-col pb-3">
              {seg.kind === "role" && (
                <Block
                  seg={seg}
                  now={now}
                  showLogo={firstOfCompany.has(seg.role.title)}
                />
              )}
            </div>
          </div>
        );
      })}

      {/* The oldest edge, so the axis is closed at both ends. */}
      <div className="flex gap-4">
        <span className="w-14 shrink-0 text-right text-[0.75rem] font-medium leading-4 tabular-nums text-md-on-surface">
          {fmtMonth(entries[entries.length - 1].role.start)}
        </span>
        <span className="w-px shrink-0" />
      </div>

      {/* What the chart is measured in, said once. A reader should not have
          to infer that height means time. */}
      <p className="mt-4 ml-[4.5rem] text-[0.75rem] leading-4 text-md-on-surface-variant">
        Each block is as tall as the time it took.
      </p>
    </div>
  );
}

function Block({
  seg,
  now,
  showLogo,
}: {
  seg: { kind: "role"; tone: number } & Entry;
  now: Date;
  showLogo: boolean;
}) {
  const { role, company, tone } = seg;
  const t = TONES[tone];
  const period = `${fmtMonth(role.start)} - ${
    role.end ? fmtMonth(role.end) : "Present"
  }`;
  const length = fmtDuration(monthsInclusive(role.start, role.end, now));

  return (
    <article
      className={`flex flex-1 flex-col gap-3 rounded-xl border p-4 ${t.block}`}
      style={
        {
          "--chart-ink": t.ink,
          "--chart-ink-muted": t.muted,
          "--chart-bullet": t.bullet,
        } as React.CSSProperties
      }
    >
      <div className="flex items-start gap-3">
        {/* The slot is held even when the mark is not drawn, so the titles of
            a run of roles at one company keep a single left edge. */}
        <div className="h-9 w-9 shrink-0">
          {showLogo && <Logo company={company} />}
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="text-[1.0625rem] font-medium leading-6">
            {role.title}
          </h3>
          <p className="chart-muted text-[0.8125rem] leading-5">
            <a
              href={company.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium no-underline hover:underline"
            >
              {company.company}
            </a>
          </p>
        </div>
      </div>

      {role.note && (
        <p className="chart-muted text-[0.875rem] leading-6">{role.note}</p>
      )}

      {/* The span sits on the block's bottom edge rather than under the
          title. A block drawn to time is mostly empty when a long role has
          little to say about itself, and an open-bottomed void reads as
          something missing; closed by its own end date, the same space reads
          as the duration it is. */}
      {role.highlights && role.highlights.length > 0 && (
        <ul className="flex flex-col gap-2">
          {role.highlights.map((h) => (
            <li
              key={h.text}
              className="chart-muted relative ml-0 pl-4 text-[0.875rem] leading-6 before:absolute before:left-0 before:top-[0.6875rem] before:h-[3px] before:w-[3px] before:rounded-full"
            >
              {h.text}
              {h.proof && (
                <>
                  {" "}
                  <Link
                    href={`/work/${h.proof.slug}`}
                    className="whitespace-nowrap font-medium underline decoration-1 underline-offset-2"
                  >
                    {h.proof.label}
                  </Link>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* A spacer rather than mt-auto: the margin reset above clears auto
          margins too, and the pin has to survive it. */}
      <div className="flex-1" />
      <p className="chart-muted text-[0.8125rem] leading-5 tabular-nums">
        {period}
        <span className="mx-1.5 opacity-60">·</span>
        {length}
      </p>
    </article>
  );
}
