import type { ExperienceCompany, ExperienceRole } from "@/db/schema";
import {
  fmtDuration,
  fmtMonth,
  januaryIndex,
  monthIndex,
  nowIndex,
} from "@/lib/experience-time";
import Image from "next/image";
import Link from "next/link";

/**
 * The career and the education on one year axis: work down the left, school
 * down the right.
 *
 * Two things are drawn, and they answer different questions. The bar is drawn
 * to time -- it spans exactly the months of its entry, against a shared year
 * ruler, so two bars are directly comparable. The card is drawn to what it
 * says, and carries everything: the title, the organisation, the note, and
 * the result lines.
 *
 * The cards flow down their own track rather than being pinned to their bars.
 * Each sits in a slot as tall as the drop to the next card, so when the
 * content fits -- which is the normal case -- the card lands exactly on its
 * bar. When a card has more to say than its slot allows, it pushes the ones
 * below it down instead of overlapping them, and the bars stay where they
 * are. The chart never lies about duration; at worst a card sits a little
 * below the bar it belongs to.
 *
 * Colour is used once, to say which track a bar belongs to. Nothing else here
 * is coloured, because nothing else here is data.
 */

type Track = "work" | "education";

type Entry = {
  role: ExperienceRole;
  org: ExperienceCompany;
  track: Track;
  from: number;
  to: number;
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

function Card({
  entry,
  now,
  showSlot,
}: {
  entry: Entry;
  now: Date;
  showSlot: boolean;
}) {
  const { role, org, showMark } = entry;

  // A span that ends in the future is a plan, not a fact. The degree read
  // "Sep 2023 - Jun 2027 . 3 yrs 10 mos" in September 2026, counting ten
  // months that had not happened. The range still shows what is planned,
  // marked as such; the duration counts only up to today.
  const today = nowIndex(now);
  const endIdx = role.end ? monthIndex(role.end) : today;
  const planned = endIdx > today;
  const period = `${fmtMonth(role.start)} - ${
    role.end ? fmtMonth(role.end) : "Present"
  }${planned ? " (expected)" : ""}`;
  const elapsed = Math.min(endIdx, today) - monthIndex(role.start) + 1;
  const length = fmtDuration(Math.max(elapsed, 1));

  return (
    <article className="exp-chart__card rounded-xl border border-md-outline-variant bg-md-surface-container-low p-3.5">
      <div className="flex gap-2.5">
        {/* Reserved only when something in this track has a mark, so a track
            of schools with no logos is not indented past an empty square.
            Within a track that does have one, the slot is held for the rows
            that repeat an organisation. */}
        {showSlot && (
          <div className="h-7 w-7 shrink-0">
            {showMark && <Mark org={org} />}
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex min-w-0 flex-col">
            <h3 className="text-[0.9375rem] font-medium leading-5 text-md-on-surface">
              {role.title}
            </h3>
            <p className="text-[0.8125rem] leading-4 text-md-on-surface-variant">
              <a
                href={org.url}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline hover:underline"
              >
                {org.company}
              </a>
              <span className="mx-1.5 opacity-60">&middot;</span>
              <span className="tabular-nums">{period}</span>
              <span className="mx-1.5 opacity-60">&middot;</span>
              <span className="tabular-nums">{length}</span>
            </p>
          </div>

          {role.note && (
            <p className="text-[0.8125rem] leading-5 text-md-on-surface-variant">
              {role.note}
            </p>
          )}

          {/* What the role actually produced. This belongs with the role, not
              in a list somewhere below the chart: splitting them left the
              chart saying where he was and nothing saying what came of it. */}
          {role.highlights && role.highlights.length > 0 && (
            <ul className="mt-0.5 flex flex-col gap-1.5">
              {role.highlights.map((h) => (
                <li
                  key={h.text}
                  className="relative ml-0 pl-3.5 text-[0.8125rem] leading-5 text-md-on-surface-variant before:absolute before:left-0 before:top-[0.5625rem] before:h-[3px] before:w-[3px] before:rounded-full before:bg-md-outline"
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
          )}
        </div>
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

  const lastOrg: Record<Track, string | null> = { work: null, education: null };
  const entries: Entry[] = usable.map((e) => {
    const showMark = lastOrg[e.track] !== e.org.company;
    lastOrg[e.track] = e.org.company;
    return { ...e, showMark };
  });

  const top = Math.max(...entries.map((e) => e.to));
  const bottom = Math.min(...entries.map((e) => e.from));
  const span = Math.max(top - bottom, 1);

  const years: number[] = [];
  for (let y = Math.ceil(bottom / 12); januaryIndex(y) <= top; y++) {
    if (januaryIndex(y) > bottom) years.push(y);
  }

  const tracks: Track[] = ["work", "education"];
  const hasEducation = entries.some((e) => e.track === "education");
  const trackHasMark: Record<Track, boolean> = {
    work: entries.some((e) => e.track === "work" && e.org.logo),
    education: entries.some((e) => e.track === "education" && e.org.logo),
  };

  return (
    // exp-timeline carries the rule that strips list markers inside
    // .article-content, which the result lists still need.
    <div className="exp-timeline exp-chart my-10">
      {/* Which side is which, said once at the top. Without it the reader has
          to infer the split from the content. */}
      {hasEducation && (
        <div className="exp-chart__legend mb-3 hidden lg:flex">
          <span className="flex-1 text-[0.75rem] font-medium uppercase leading-4 tracking-[0.06em] text-md-on-surface-variant">
            Work
          </span>
          <span className="flex-1 text-right text-[0.75rem] font-medium uppercase leading-4 tracking-[0.06em] text-md-on-surface-variant">
            Education
          </span>
        </div>
      )}

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
              { "--exp-top": top - januaryIndex(y) } as React.CSSProperties
            }
          >
            {y}
          </span>
        ))}

        {/* The bars: the only thing here drawn to time, and the only thing
            here that is coloured. */}
        {entries.map((e) => (
          <span
            key={`bar-${e.track}-${e.org.company}-${e.role.title}`}
            aria-hidden="true"
            className={`exp-chart__bar exp-chart__bar--${e.track} absolute`}
            style={
              {
                "--exp-top": top - e.to,
                "--exp-span": Math.max(e.to - e.from, 1),
              } as React.CSSProperties
            }
          />
        ))}

        {tracks.map((track) => {
          const list = entries.filter((e) => e.track === track);
          if (!list.length) return null;
          return (
            <div
              key={track}
              className={`exp-chart__track exp-chart__track--${track} absolute top-0`}
            >
              {/* The drop from the top of the chart to the first card on this
                  side. */}
              <div
                className="exp-chart__lead"
                style={
                  { "--exp-slot": top - list[0].to } as React.CSSProperties
                }
              />
              {list.map((e, i) => {
                const next = list[i + 1];
                return (
                  <div
                    key={`${e.org.company}-${e.role.title}`}
                    className="exp-chart__slot"
                    style={
                      {
                        // As tall as the drop to the next card, so a card that
                        // fits lands exactly on its bar and one that does not
                        // pushes rather than overlaps.
                        "--exp-slot": next ? e.to - next.to : 0,
                      } as React.CSSProperties
                    }
                  >
                    <Card
                      entry={e}
                      now={now}
                      showSlot={trackHasMark[e.track]}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
