import type { ExperienceCompany, ExperienceRole } from "@/db/schema";
import {
  fmtDuration,
  fmtMonth,
  monthIndex,
  monthsInclusive,
  nowIndex,
} from "@/lib/experience-time";
import Image from "next/image";
import Link from "next/link";

/**
 * The career and the education, as one vertical timeline in two sections.
 *
 * Roles are grouped under the organisation they were held at, and the rule
 * descends from that organisation's mark. That is the same shape the homepage
 * column uses, on purpose: the two should read as one idea at two sizes, and
 * the flat version of this repeated "SEONGON" on three consecutive rows while
 * saying nothing about them being three roles at one employer.
 *
 * This replaced a chart that drew every entry as a bar whose height was its
 * duration. The measurement was honest and the reading was not: a 45-month
 * degree became a wall, the cards had to be squeezed terse to fit between the
 * bars, and the result lines ended up somewhere else on the page. Duration is
 * written down now, and every entry gets the room its text needs.
 *
 * Nothing here is coloured. The rule and its nodes are the only furniture,
 * and they earn it: a run of roles at one company is a sequence, and the line
 * is what says so.
 */

type Track = "work" | "education";

const SECTIONS: { track: Track; label: string }[] = [
  { track: "work", label: "Experience" },
  { track: "education", label: "Education" },
];

function Role({ role, now }: { role: ExperienceRole; now: Date }) {
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
    // The text sits at 52px, which is the mark plus its gap, so a role title
    // and the organisation name above it share one left edge.
    <li className="relative ml-0 flex flex-col gap-2 pl-[2.0625rem]">
      <span
        aria-hidden="true"
        className="absolute left-0 top-[0.5rem] h-2 w-2 -translate-x-1/2 rounded-full bg-md-surface ring-1 ring-md-outline"
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

      {role.note && <p className="exp-org">{role.note}</p>}

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

function Org({ org, now }: { org: ExperienceCompany; now: Date }) {
  // Roles are newest first, so the organisation span runs from the last
  // start to the first end.
  const roles = org.roles;
  if (!roles.length) return null;
  const total = fmtDuration(
    monthsInclusive(roles[roles.length - 1].start, roles[0].end, now),
  );

  return (
    <div>
      <div className="flex items-center gap-4">
        {org.logo && (
          <a
            href={org.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
            aria-label={org.company}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-md-outline-variant bg-md-surface-container-low">
              <Image
                src={org.logo}
                alt=""
                width={36}
                height={36}
                className="h-5 w-5 object-contain"
              />
            </span>
          </a>
        )}
        <p className="exp-org flex flex-wrap items-baseline gap-x-2">
          <a
            href={org.url}
            target="_blank"
            rel="noopener noreferrer"
            className="exp-orgname"
          >
            {org.company}
          </a>
          {/* Only when there is more than one role to add up. One role and
              the total is the role, said twice. */}
          {roles.length > 1 && (
            <span className="exp-meta tabular-nums">&middot; {total}</span>
          )}
        </p>
      </div>

      {/* The rule starts at the mark's bottom edge and runs down its centre
          line: ml is half the 36px mark, and the padding is inside the border
          so it begins where the mark ends rather than below the gap. */}
      <ol className="exp-rule flex flex-col gap-7 border-l border-md-outline-variant pt-5">
        {roles.map((role) => (
          <Role key={role.title} role={role} now={now} />
        ))}
      </ol>
    </div>
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

  const order = (org: ExperienceCompany) =>
    Math.max(
      ...org.roles.map((r) => (r.end ? monthIndex(r.end) : today)),
      Number.NEGATIVE_INFINITY,
    );

  return (
    <div className="exp-timeline my-10 flex flex-col gap-12">
      {SECTIONS.map(({ track, label }) => {
        const orgs = companies
          .filter(
            (c) =>
              (c.kind === "education" ? "education" : "work") === track &&
              c.roles.length > 0,
          )
          .sort((a, b) => order(b) - order(a));
        if (!orgs.length) return null;

        return (
          <section key={track} className="flex flex-col gap-6">
            <h2>{label}</h2>
            <div className="flex flex-col gap-10">
              {orgs.map((org) => (
                <Org key={org.company} org={org} now={now} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
