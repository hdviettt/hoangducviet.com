import WorkSection from "@/components/work/WorkSection";
import { IDENTITY } from "@/lib/identity";
import { getProjects } from "@/lib/projects";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";
  const description =
    "Two bodies of work: a search engine built from scratch, and an AI platform of agents I built and led inside a company.";
  return {
    title: `Work - ${IDENTITY.name}`,
    description,
    alternates: { canonical: "/work" },
    openGraph: { title: `Work - ${IDENTITY.name}`, description, url: `${baseUrl}/work` },
  };
}

export default async function WorkPage() {
  const projects = await getProjects();
  const byslug = new Map(projects.map((p) => [p.slug, p]));

  return (
    <div className="pb-24 md:pb-32">
      <header className="max-w-[820px] pt-12 md:pt-20">
        <h1 className="text-[42px] leading-[1.03] font-medium tracking-[-0.035em] text-md-on-surface sm:text-[56px]">
          Systems I built, not slides I made.
        </h1>
        <p className="mt-6 max-w-[60ch] text-[17px] leading-[1.55] text-md-on-surface-variant">
          Two bodies of work. A search engine built from scratch to understand
          retrieval end to end, and an AI platform of agents I built and led
          inside a 117-person company. Most of it started as a black box I
          wanted to take apart.
        </p>
      </header>

      <div className="mt-20 flex flex-col md:mt-28">
        {projects.map((p, i) => {
          const parent =
            p.parentSlug && byslug.has(p.parentSlug)
              ? { title: byslug.get(p.parentSlug)!.title, slug: p.parentSlug }
              : undefined;
          return (
            <div
              key={p.slug}
              className="border-t border-md-outline-variant py-16 first:border-t-0 first:pt-0 md:py-24"
            >
              <WorkSection project={p} index={i} parent={parent} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
