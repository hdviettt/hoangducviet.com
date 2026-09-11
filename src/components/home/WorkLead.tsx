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
 * So: one project leads at full size, because the split block with its artwork
 * is the best thing this site draws. The other two become rows. A reader who
 * wants the full versions is one click away, and that click now buys them
 * something.
 */
export default function WorkLead({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;
  const [lead, ...rest] = projects;

  return (
    <section id="work" className="scroll-mt-8">
      <div className="work-breakout site-grid items-baseline">
        <h2 className="col-1 text-[1.4375rem] font-medium tracking-[-0.02em] text-md-on-surface">
          Selected work
        </h2>
        <p className="col-2 text-[0.9375rem] leading-7 text-md-on-surface-variant">
          A search engine built from scratch, and an AI platform of agents I
          built and led inside a company.
        </p>
      </div>

      <div className="work-breakout mt-9 md:mt-12">
        <FeaturedWork project={lead} />

        {rest.length > 0 && (
          <ul className="mt-14 border-t border-md-outline-variant md:mt-16">
            {rest.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/work/${p.slug}`}
                  className="group site-grid items-baseline border-b border-md-outline-variant py-6"
                >
                  <h3 className="col-1 text-[1.1875rem] font-medium leading-[1.25] tracking-[-0.013em] text-md-on-surface transition-colors group-hover:text-primary">
                    {p.title}
                  </h3>
                  {p.description && (
                    <p className="col-2 text-[0.9375rem] leading-7 text-md-on-surface-variant">
                      {p.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 flex items-center gap-5 md:gap-8">
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
