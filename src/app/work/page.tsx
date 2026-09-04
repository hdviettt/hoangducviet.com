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
      <div className="flex flex-col pt-12 md:pt-16">
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
