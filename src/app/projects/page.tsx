import { Icon } from "@/components/ui/Icon";
import { getProjects } from "@/lib/projects";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

const BUILD_LABEL: Record<string, string> = {
  live: "Live",
  wip: "WIP",
  archived: "Archived",
};

function buildDotClass(status: string): string {
  if (status === "live") return "bg-green-500";
  if (status === "wip") return "bg-amber-500";
  return "bg-md-outline";
}

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";
  const title = "Projects";
  const description =
    "Things I've built — search engines, GEO tooling, and experiments, most with the code open.";
  return {
    title,
    description,
    alternates: { canonical: "/projects" },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/projects`,
      type: "website",
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function ProjectsPage() {
  const items = await getProjects({ onlyPublished: true });

  return (
    <div className="pt-10 sm:pt-14 md:pt-20 pb-16 md:pb-24">
      <header className="mb-10 md:mb-14 max-w-2xl">
        <p className="md-label-medium uppercase tracking-widest text-md-on-surface-variant mb-4">
          Projects
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-[44px] md:leading-[52px] font-normal tracking-tight text-md-on-surface mb-4">
          Things I've built
        </h1>
        <p className="text-lg text-md-on-surface-variant leading-relaxed">
          Search engines, GEO tooling, and experiments — reverse-engineering how
          ranking works by building it. Most ship with the code open.
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-md-on-surface-variant text-sm">Nothing here yet.</p>
      ) : (
        <div className="grid gap-4 md:gap-5 md:grid-cols-2">
          {items.map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="group flex flex-col p-6 rounded-2xl border border-md-outline-variant bg-md-surface-container-low hover:bg-md-surface-container hover:shadow-md-1 transition-all duration-200 ease-md-standard"
            >
              <div className="flex items-center gap-1.5 mb-3 md-label-small uppercase tracking-wider text-md-on-surface-variant">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${buildDotClass(p.buildStatus)}`}
                />
                {BUILD_LABEL[p.buildStatus] ?? p.buildStatus}
              </div>

              <h2 className="md-title-large md:text-2xl md:leading-8 font-medium tracking-tight text-md-on-surface group-hover:text-primary transition-colors duration-200">
                {p.title}
              </h2>

              {p.tagline && (
                <p className="mt-3 md-body-medium text-md-on-surface-variant line-clamp-3">
                  {p.tagline}
                </p>
              )}

              {p.techTags && p.techTags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.techTags.map((t) => (
                    <span
                      key={t}
                      className="md-label-small text-md-on-surface-variant border border-md-outline-variant rounded-full px-2 py-0.5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <span className="mt-auto pt-5 inline-flex items-center gap-1 md-label-medium text-md-on-surface-variant group-hover:text-primary transition-colors duration-200">
                View project
                <Icon
                  name="arrow_forward"
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
