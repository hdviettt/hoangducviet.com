import { EXPERIENCE } from "@/lib/resume";
import Image from "next/image";
import Link from "next/link";

/**
 * The experience timeline, as a widget you place in the About body with
 * ```widget:experience```.
 *
 * It is worth being blunt in the file itself, because the page it came from
 * claimed otherwise: this is NOT synced from LinkedIn. There has never been a
 * sync. The data is hand-written in lib/resume.ts, and keeping it current means
 * editing that file. LinkedIn does not expose your own positions to a plain API
 * call without partner access, so a real sync is not a small change.
 *
 * What the page does that a CV cannot, and the reason it is drawn rather than
 * typed out:
 *
 *   Every duration is recomputed from the real clock at render, so nothing
 *   here goes stale. A role with no `end` reads "Present" and its length grows
 *   on its own.
 *
 *   A claim can carry `proof` — a link straight to the project page that
 *   demonstrates it. A line that says the platform runs twenty solutions is an
 *   assertion; the same line pointing at the platform is evidence.
 */

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function ym(s: string): { y: number; m: number } {
  const [y, m] = s.split("-").map(Number);
  return { y, m };
}

function fmtMonth(s: string): string {
  const { y, m } = ym(s);
  return `${MONTHS[m - 1]} ${y}`;
}

// Inclusive month count, which is how LinkedIn tallies tenure: both endpoint
// months count, so Aug to Aug is 13 months and not 12. Matching that matters
// only because a reader who has both open should not find two numbers.
function monthsInclusive(
  start: string,
  end: string | undefined,
  now: Date,
): number {
  const s = ym(start);
  const e = end ? ym(end) : { y: now.getFullYear(), m: now.getMonth() + 1 };
  return (e.y - s.y) * 12 + (e.m - s.m) + 1;
}

function fmtDuration(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y) parts.push(`${y} yr${y > 1 ? "s" : ""}`);
  if (m) parts.push(`${m} mo${m > 1 ? "s" : ""}`);
  return parts.join(" ") || "1 mo";
}

export default function Experience() {
  // One clock for the whole render, so two durations on the same page cannot
  // disagree because the month turned over between them.
  const now = new Date();

  return (
    <div className="exp-timeline my-10 space-y-12">
      {EXPERIENCE.map((company) => {
        // Roles are newest first, so the span runs from the last one's start to
        // the first one's end.
        const earliest = company.roles[company.roles.length - 1].start;
        const latestEnd = company.roles[0].end;
        const companyDuration = fmtDuration(
          monthsInclusive(earliest, latestEnd, now),
        );

        return (
          <div key={company.company} className="flex gap-4">
            <a
              href={company.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
              aria-label={company.company}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-md-outline-variant bg-md-surface-container-low">
                <Image
                  src={company.logo}
                  alt=""
                  width={44}
                  height={44}
                  className="h-6 w-6 object-contain"
                />
              </span>
            </a>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <a
                  href={company.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[1.0625rem] font-medium leading-6 text-md-on-surface no-underline transition-colors hover:text-primary"
                >
                  {company.company}
                </a>
                <span className="text-[0.8125rem] tabular-nums text-md-on-surface-variant">
                  · {companyDuration}
                </span>
              </div>
              {company.location && (
                <p className="mt-0.5 text-[0.8125rem] text-md-on-surface-variant">
                  {company.location}
                </p>
              )}

              {/* One rule, down the left of the roles. It is the exception to
                  this site's "space, not lines" rule and it earns it: five
                  roles at one company are a sequence, and the line is what
                  says they are the same thread rather than five jobs. */}
              <ol className="mt-5 ml-1 space-y-6 border-l border-md-outline-variant">
                {company.roles.map((role) => {
                  const period = `${fmtMonth(role.start)} — ${
                    role.end ? fmtMonth(role.end) : "Present"
                  }`;
                  const length = fmtDuration(
                    monthsInclusive(role.start, role.end, now),
                  );

                  return (
                    <li key={role.title} className="relative ml-0 pl-5">
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-[0.5625rem] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-md-outline"
                      />
                      <h3 className="text-[0.9375rem] font-medium leading-6 text-md-on-surface">
                        {role.title}
                      </h3>
                      <p className="mt-0.5 text-[0.8125rem] leading-5 text-md-on-surface-variant">
                        {role.type && <>{role.type} · </>}
                        <span className="tabular-nums">{period}</span>
                        <span className="mx-1.5 opacity-60">·</span>
                        <span className="tabular-nums">{length}</span>
                      </p>

                      {role.note && (
                        <p className="mt-2 text-[0.875rem] leading-6 text-md-on-surface-variant">
                          {role.note}
                        </p>
                      )}

                      {role.highlights && role.highlights.length > 0 && (
                        <ul className="mt-3 space-y-2">
                          {role.highlights.map((h) => (
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
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        );
      })}
    </div>
  );
}
