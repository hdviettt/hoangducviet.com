import CompactWork from "@/components/work/CompactWork";
import FeaturedWork from "@/components/work/FeaturedWork";
import type { Project } from "@/lib/projects";
import Link from "next/link";

/**
 * IDEA 1 — the homepage as a front page.
 *
 * Measured on the live site: "Selected work" is 1915px of a 3434px homepage,
 * 56% of it, spent on three projects that /work then repeats in full. The
 * writing — eighteen items, and the thing this site is for — gets 779px at the
 * bottom.
 *
 * The three featured projects, each in the same block /work uses.
 *
 * There was a version of this where one project led at full size and the other
 * two were rows. Measured, those rows typeset their titles at 15.2px/500 —
 * which is the size and weight of an article row — so the same project read as
 * a project on /work and as a piece of writing here. A hierarchy that turns
 * two of three things into a different kind of thing is not a hierarchy, it is
 * an inconsistency. They are all the same block now.
 *
 * What the page still does not do is repeat the whole archive underneath: the
 * feed below shows six items rather than eighteen, which is where /posts got
 * its job back.
 */
export default function WorkLead({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <section id="work" className="scroll-mt-8">
      {/* The masthead is the heading alone. It used to carry a sentence in the
          second column summarising the three projects underneath, which the
          three projects then said better in their own words. */}
      <div className="work-breakout">
        <h2 className="text-[1.4375rem] font-medium tracking-[-0.02em] text-md-on-surface">
          Selected work
        </h2>
      </div>

      {/* The same separators /work uses, so a project sits in the same frame on
          both pages rather than in a homepage-shaped one. */}
      {/* Same shape as /work: two lead the section, the remainder sit two-up.
          On the homepage this matters more than on /work, because the writing
          feed underneath was 3.76 screens down and every full-width block was
          pushing it further. */}
      <div className="work-breakout mt-9 flex flex-col gap-4 md:mt-12">
        {projects.slice(0, 2).map((p) => (
          <div key={p.slug}>
            <FeaturedWork project={p} />
          </div>
        ))}

        {projects.length > 2 && (
          <div className="work-grid">
            {projects.slice(2).map((p) => (
              <CompactWork key={p.slug} project={p} />
            ))}
          </div>
        )}

        <div className="flex items-center gap-5 md:gap-8">
          <span
            aria-hidden="true"
            className="h-px flex-1 bg-md-outline-variant"
          />
          <Link
            href="/work"
            className="md-btn md-btn-outlined md-btn-pill md-btn-lg shrink-0 no-underline"
          >
            All work
          </Link>
          <span
            aria-hidden="true"
            className="h-px flex-1 bg-md-outline-variant"
          />
        </div>
      </div>
    </section>
  );
}
