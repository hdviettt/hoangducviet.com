import { ChildRow } from "@/components/work/ProjectRow";
import ProjectReference from "@/components/work/ProjectReference";
import MediaCarousel from "@/components/widgets/MediaCarousel";
import { IDENTITY } from "@/lib/identity";
import { getProjectBySlug } from "@/lib/projects";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) return { title: `Work - ${IDENTITY.name}` };
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";
  const description = project.tagline ?? project.description ?? "";
  return {
    title: `${project.title} - ${IDENTITY.name}`,
    description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: project.title,
      description,
      url: `${baseUrl}/work/${project.slug}`,
      type: "article",
    },
  };
}

function ExtButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1.5 rounded-full border border-md-outline-variant px-4 py-2 text-[13.5px] font-medium text-md-on-surface transition-colors hover:border-primary hover:text-primary"
    >
      {label}
      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
        ↗
      </span>
    </a>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 text-[12.5px] font-medium uppercase tracking-[0.08em] text-md-on-surface-variant">
      {children}
    </h2>
  );
}

export default async function ProjectDeepDivePage({
  params,
}: {
  params: { slug: string };
}) {
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();

  const hasMedia = project.media.length > 0;
  const hasChildren = !!project.children && project.children.length > 0;
  const hasPosts = !!project.posts && project.posts.length > 0;

  return (
    <div className="pb-20 md:pb-28">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2.5 pt-10 text-[14px] sm:pt-12 md:pt-14">
        <Link href="/work" className="text-md-on-surface-variant transition-colors hover:text-primary">
          ← Work
        </Link>
        {project.parent && (
          <>
            <span className="text-md-outline-variant">/</span>
            <Link
              href={`/work/${project.parent.slug}`}
              className="text-md-on-surface-variant transition-colors hover:text-primary"
            >
              {project.parent.title}
            </Link>
          </>
        )}
      </div>

      <div className="mt-8 max-w-[880px]">
        {/* Hero */}
        <header>
          <h1 className="max-w-[20ch] text-[34px] leading-[1.05] font-medium tracking-[-0.03em] text-md-on-surface sm:text-[42px]">
            {project.title}
          </h1>
          {project.description && (
            <p className="mt-5 max-w-[68ch] text-[17px] leading-[1.55] text-md-on-surface-variant">
              {project.description}
            </p>
          )}
          {(project.repoUrl || project.liveUrl) && (
            <div className="mt-7 flex flex-wrap gap-3">
              {project.liveUrl && <ExtButton href={project.liveUrl} label="Live demo" />}
              {project.repoUrl && <ExtButton href={project.repoUrl} label="View the code" />}
            </div>
          )}
        </header>

        {/* Visual: a carousel of the project's real media (screenshots, clips) */}
        {hasMedia && (
          <div className="work-carousel mt-12">
            <MediaCarousel
              items={project.media.map((m) => ({
                src: m.src,
                caption: m.caption,
                type: m.type,
                fit: "cover",
              }))}
              ratio="16 / 9"
              mat="ambient"
              label={`${project.title} media`}
            />
          </div>
        )}

        {/* Narrative */}
        {project.content && (
          <div
            className="article-content mt-14 md:mt-16"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted admin content
            dangerouslySetInnerHTML={{ __html: project.content }}
          />
        )}

        {/* Reference: what it does + built with */}
        {(project.features.length > 0 ||
          project.stack.length > 0 ||
          project.models.length > 0) && (
          <section className="mt-14 border-t border-md-outline-variant pt-10 md:mt-16">
            <ProjectReference
              features={project.features}
              stack={project.stack}
              models={project.models}
            />
          </section>
        )}

        {/* Pieces on the platform */}
        {hasChildren && (
          <section className="mt-14 border-t border-md-outline-variant pt-10 md:mt-16">
            <SectionLabel>Pieces on the platform</SectionLabel>
            <div>
              {project.children?.map((c) => (
                <ChildRow key={c.slug} child={c} />
              ))}
            </div>
          </section>
        )}

        {/* Writing */}
        {hasPosts && (
          <section className="mt-14 border-t border-md-outline-variant pt-10 md:mt-16">
            <SectionLabel>
              {project.posts && project.posts.length > 1
                ? `Writing (${project.posts.length} parts)`
                : "Writing"}
            </SectionLabel>
            <ul className="divide-y divide-md-outline-variant">
              {project.posts?.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/posts/${p.slug}`}
                    className="group flex items-baseline gap-3.5 py-3.5"
                  >
                    {p.date_created && (
                      <span className="shrink-0 font-mono text-[12px] tabular-nums text-md-on-surface-variant">
                        {p.date_created.slice(0, 10).split("-").reverse().join(".")}
                      </span>
                    )}
                    <span className="text-[15.5px] text-md-on-surface transition-colors group-hover:text-primary">
                      {p.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
