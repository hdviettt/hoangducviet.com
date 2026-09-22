import ExperienceTimeline from "@/components/about/ExperienceTimeline";
import type { ExperienceCompany } from "@/db/schema";
import { fmtDuration, fmtMonth, monthsInclusive } from "@/lib/experience-time";
import Image from "next/image";
import Link from "next/link";

/**
 * The experience timeline, as a widget you place in the About body with
 * ```widget:experience```.
 *
 * The data comes from the CMS -- `profile.experience`, edited in
 * /admin/settings -- and is handed down by the About page, because this is a
 * client boundary and cannot read the database itself.
 *
 * Worth being blunt here, because the page this came from claimed otherwise:
 * nothing is synced from LinkedIn. There has never been a sync, and LinkedIn
 * does not expose your own positions to a plain API call without partner
 * access, so there will not be one. What exists instead is an editor: the
 * profile changes, you paste the change into the CMS, and the site follows.
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

/**
 * One company: the logo and name, then its roles.
 *
 * A component rather than JSX built inside the map, because the header and
 * the role list are assembled once and then placed differently by the two
 * layouts, and elements created inside a `.map()` callback read to the linter
 * as unkeyed list items even when they are not.
 */
function CompanyBlock({
  company,
  compact,
  now,
}: {
  company: ExperienceCompany;
  compact: boolean;
  now: Date;
}) {
  // Roles are newest first, so the span runs from the last one's start to
  // the first one's end.
  const earliest = company.roles[company.roles.length - 1].start;
  const latestEnd = company.roles[0].end;
  const companyDuration = fmtDuration(
    monthsInclusive(earliest, latestEnd, now),
  );

  const logo = company.logo && (
    <a
      href={company.url}
      target="_blank"
      rel="noopener noreferrer"
      className="shrink-0"
      aria-label={company.company}
    >
      {/* 36px in compact, not 44. The header there is a single line of
          text, about 24px tall, and a 44px tile beside it hung 20px below
          the name it belongs to -- the name's centre measured 10px above
          the tile's. It was two lines tall until the location came off. */}
      <span
        className={`flex items-center justify-center rounded-xl border border-md-outline-variant bg-md-surface-container-low ${
          compact ? "h-9 w-9" : "h-11 w-11"
        }`}
      >
        <Image
          src={company.logo}
          alt=""
          width={44}
          height={44}
          className={`object-contain ${compact ? "h-5 w-5" : "h-6 w-6"}`}
        />
      </span>
    </a>
  );

  const heading = (
    <div className="min-w-0">
      <div className="flex flex-wrap items-baseline gap-2">
        <a
          href={company.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`no-underline transition-colors hover:text-primary ${
            compact
              ? "text-[0.8125rem] font-medium leading-5 text-md-on-surface-variant"
              : "text-[1.0625rem] font-medium leading-6 text-md-on-surface"
          }`}
        >
          {company.company}
        </a>
        <span className="text-[0.8125rem] tabular-nums text-md-on-surface-variant">
          · {companyDuration}
        </span>
      </div>
      {/* Where the office is, and whether it is on-site, is not something
          the hero column has to answer. Detail belongs on the page that
          exists for detail. */}
      {!compact && company.location && (
        <p className="mt-0.5 text-[0.8125rem] text-md-on-surface-variant">
          {company.location}
        </p>
      )}
    </div>
  );

  // One rule, down the left of the roles. It is the exception to this
  // site's "space, not lines" rule and it earns it: five roles at one
  // company are a sequence, and the line is what says they are the same
  // thread rather than five jobs.
  //
  // No spine when compact. The rule and its dots are timeline furniture
  // that needs density to read as a line; against three short rows it
  // started below the logo instead of running through it, so it looked
  // like something left behind rather than drawn.
  const roles = (
    <ol
      className={
        compact
          ? // The rule starts under the logo's centre -- ml is half the 36px
            // tile -- so it reads as one thread descending from the company
            // rather than as a border on a list. The li padding puts role
            // titles at 52px, which is where the company name already sits
            // (36 + the 1rem gap), so the column keeps one left edge. The
            // padding is 33px rather than 34 because the rule's own 1px sits
            // inside the measurement.
            "ml-[1.125rem] space-y-4 border-l border-md-outline-variant pt-4"
          : "mt-5 ml-1 space-y-6 border-l border-md-outline-variant"
      }
    >
      {company.roles.map((role) => {
        // A hyphen, not an em dash. This is a date range, and the
        // source it is read against writes it with a hyphen.
        const period = `${fmtMonth(role.start)} - ${
          role.end ? fmtMonth(role.end) : "Present"
        }`;
        const length = fmtDuration(monthsInclusive(role.start, role.end, now));

        return (
          <li
            key={role.title}
            className={`relative ml-0 ${compact ? "pl-[2.0625rem]" : "pl-5"}`}
          >
            {/* The node on the rule. Compact has one now too: without it the
                rule was a plain border and the rows had nothing sitting on
                it. */}
            <span
              aria-hidden="true"
              className="absolute left-0 top-[0.5625rem] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-md-outline"
            />
            <h3 className="text-[0.9375rem] font-medium leading-6 text-md-on-surface">
              {role.title}
            </h3>
            {/* Dates first on every row, always.
                        The employment type led this line when it was set and
                        was simply absent when it was not, so of three roles
                        one began with a date, one with "Full-time" and one
                        with "Internship" — three shapes, and the dates
                        landed in a different place on each. They are the one
                        field every role has, so they set the column, and the
                        type trails as the optional thing it is. */}
            <p className="mt-0.5 text-[0.8125rem] leading-5 text-md-on-surface-variant">
              <span className="tabular-nums">{period}</span>
              <span className="mx-1.5 opacity-60">·</span>
              <span className="tabular-nums">{length}</span>
              {/* Not in the hero. "Internship" after a title that already
                  reads "Operation Intern" is the same fact twice, and it
                  was the field that made one row longer than the next.
                  Title and dates are what the column is for. */}
              {!compact && role.type && (
                <>
                  <span className="mx-1.5 opacity-60">·</span>
                  {role.type}
                </>
              )}
            </p>

            {!compact && role.note && (
              <p className="mt-2 text-[0.875rem] leading-6 text-md-on-surface-variant">
                {role.note}
              </p>
            )}

            {!compact && role.highlights && role.highlights.length > 0 && (
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
  );

  // Compact hangs the roles off the logo rather than nesting them in a
  // content column, because that is what lets the rule start under the logo's
  // centre. The grouping the indent used to carry is carried by the rule now,
  // which is the stronger signal and the one a timeline is expected to have.
  // The full version keeps the nested column: its roles hold notes and result
  // lists, so they want the wider measure.
  return compact ? (
    <div>
      <div className="flex items-center gap-4">
        {logo}
        {heading}
      </div>
      {roles}
    </div>
  ) : (
    <div className="flex gap-4">
      {logo}
      <div className="min-w-0 flex-1">
        {heading}
        {roles}
      </div>
    </div>
  );
}

export default function Experience({
  companies = [],
  compact = false,
}: {
  companies?: ExperienceCompany[];
  /**
   * Titles and dates only: no result lines, no notes.
   *
   * The homepage runs this beside the identity block, where the full version
   * is five paragraphs of results against a bio of three — it would have been
   * the longest thing on the page and buried the work below it. Compact, the
   * column says where he has been and how long, and "More about me" carries
   * anyone who wants the rest to the page that has room for it.
   */
  compact?: boolean;
}) {
  // An empty timeline draws nothing rather than an empty frame. The widget can
  // be in the body before the data is filled in.
  if (!companies.length) return null;

  // The full view is its own component: a vertical timeline in two sections,
  // with the room that notes and result lines need. Only the homepage column
  // stays this compact list, because at 310px beside a bio the question is
  // where he has been, not what came of it.
  if (!compact) return <ExperienceTimeline companies={companies} />;

  // Work only in the column beside the bio. The chart shows school because it
  // has an axis to hang it on and a second track to put it in; a 310px list
  // has neither, and three degrees would push the work off the block.
  const jobs = companies.filter((c) => c.kind !== "education");
  if (!jobs.length) return null;
  // One clock for the whole render, so two durations on the same page cannot
  // disagree because the month turned over between them.
  const now = new Date();

  return (
    // No vertical margin in compact: beside the identity block that 40px top
    // margin pushed the column 40px below the photo, and the same margin at
    // the bottom stacked with the button's own to leave a 64px hole — four
    // times the gap between roles.
    <div className={`exp-timeline space-y-12 ${compact ? "" : "my-10"}`}>
      {jobs.map((company) => (
        <CompanyBlock
          key={company.company}
          company={company}
          compact={compact}
          now={now}
        />
      ))}
    </div>
  );
}
