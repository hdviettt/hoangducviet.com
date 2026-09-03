import WorkSection from "@/components/work/WorkSection";
import type { Project } from "@/lib/projects";
import Link from "next/link";

/**
 * Homepage "Selected work": the featured (top-level) projects, rendered as the
 * same full-bleed immersive showcase sections used on /work, so the two are
 * consistent. The platform's individual pieces live on /work.
 */
export default function SelectedWork({ projects }: { projects: Project[] }) {
  const topLevel = projects.filter((p) => !p.parentSlug);
  if (topLevel.length === 0) return null;

  return (
    <section id="work" className="scroll-mt-8">
      <div className="max-w-[820px]">
        <h2 className="text-[26px] font-medium tracking-[-0.02em] text-md-on-surface">
          Selected work
        </h2>
        <p className="mt-3 max-w-[600px] text-[15px] leading-[1.55] text-md-on-surface-variant">
          A search engine built from scratch, and an AI platform of agents I
          built and led inside a company.
        </p>
      </div>

      <div className="mt-12 flex flex-col md:mt-16">
        {topLevel.map((p, i) => (
          <div
            key={p.slug}
            className="border-t border-md-outline-variant py-14 first:border-t-0 first:pt-4 md:py-20"
          >
            <WorkSection project={p} index={i} />
          </div>
        ))}
      </div>

      <Link
        href="/work"
        className="group mt-10 inline-flex items-center gap-1.5 text-[14.5px] font-medium text-primary hover:underline"
      >
        See all work
        <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
          {"->"}
        </span>
      </Link>
    </section>
  );
}
