import type { ExperienceCompany, ExperienceRole } from "@/db/schema";
import {
  fmtDuration,
  fmtMonth,
  monthIndex,
  nowIndex,
} from "@/lib/experience-time";
import Image from "next/image";
import Link from "next/link";

/**
 * The career and the education, as one vertical timeline in two sections.
 *
 * This replaced a chart that drew every entry as a bar whose height was its
 * duration. The measurement was honest and the reading was not: a 45-month
 * degree became a wall, the cards had to be squeezed terse to fit between
 * bars, and the result lines -- the only part that says what any of it
 * amounted to -- ended up somewhere else on the page. Height carrying
 * duration cost more than it bought, so duration is written down instead and
 * every entry gets the room its text needs.
 *
 * Nothing here is coloured. The rule and its nodes are the only furniture,
 * and they earn it: a run of roles at one company is a sequence, and the line
 * is what says so.
 *
 * Durations are recomputed from the real clock at render, so nothing goes
 * stale, and a span that ends in the future is marked as planned rather than
 * counted as served.
 */

type Track = "work" | "education";

const SECTIONS: { track: Track; label: string }[] = [
  { track: "work", label: "Experience" },
  { track: "education", label: "Education" },
];

type Entry = {
  role: ExperienceRole;
  org: ExperienceCompany;
  track: Track;
  to: number;
};

function Row({ entry, now }: { entry: Entry; now: Date }) {
  const { role, org } = entry;

  // A span that ends in the future is a plan, not a fact. The degree read
  // "Sep 2023 - Jun 2027, 3 yrs 10 mos" in September 2026, counting ten
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
    <li className="relative ml-0 flex flex-col gap-2 pl-7">
      <span
        aria-hidden="true"
        className="absolute left-0 top-[0.5625rem] h-[0.4375rem] w-[0.4375rem] -translate-x-1/2 rounded-full bg-md-outline"
      />

      {/* Title and dates on one line, the dates pushed right. They wrap onto
          their own line rather than colliding when the measure is narrow. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3>{role.title}</h3>
        <p className="exp-meta">
          <span className="tabular-nums">{period}</span>
          <span className="mx-1.5 opacity-60">&middot;</span>
          <span className="tabular-nums">{length}</span>
        </p>
      </div>

      <p className="exp-org flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {org.logo && (
          <Image
            src={org.logo}
            alt=""
            width={20}
            height={20}
            className="h-4 w-4 shrink-0 object-contain"
          />
        )}
        <a
          href={org.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium no-underline hover:underline"
        >
          {org.company}
        </a>
        {role.note && (
          <>
            <span className="opacity-60">&middot;</span>
            <span>{role.note}</span>
          </>
        )}
      </p>

      {role.highlights && role.highlights.length > 0 && (
        <ul className="flex flex-col gap-2 pt-1">
          {role.highlights.map((h) => (
            <li
              key={h.text}
              className="exp-result relative ml-0 pl-4 before:absolute before:left-0 before:top-[0.6875rem] before:h-[3px] before:w-[3px] before:rounded-full before:bg-md-outline"
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
    </li>
  );
}

export default function ExperienceTimeline({
  companies,
}: {
  companies: ExperienceCompany[];
}) {
  // One clock for the whole render, so two durations on the same page cannot
  // disagree because the month turned over between them.
  const now = new Date();
  const today = nowIndex(now);

  const entries: Entry[] = companies
    .flatMap((org) =>
      org.roles.map((role) => ({
        role,
        org,
        track: (org.kind === "education" ? "education" : "work") as Track,
        to: role.end ? monthIndex(role.end) : today,
      })),
    )
    .filter((e) => Number.isFinite(e.to))
    .sort((a, b) => b.to - a.to);

  if (!entries.length) return null;

  return (
    <div className="exp-timeline my-10 flex flex-col gap-11">
      {SECTIONS.map(({ track, label }) => {
        const list = entries.filter((e) => e.track === track);
        if (!list.length) return null;
        return (
          <section key={track} className="flex flex-col gap-5">
            <h2>{label}</h2>
            {/* One rule down the left. It is the exception to this site's
                "space, not lines" rule and it earns it: a run of roles at one
                company is a sequence, and the line is what says they are the
                same thread rather than separate jobs. */}
            <ol className="ml-1 flex flex-col gap-8 border-l border-md-outline-variant">
              {list.map((e) => (
                <Row
                  key={`${e.org.company}-${e.role.title}`}
                  entry={e}
                  now={now}
                />
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
