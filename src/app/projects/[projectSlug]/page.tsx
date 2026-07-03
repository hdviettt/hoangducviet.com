import { Icon } from "@/components/ui/Icon";
import { createBreadcrumbSchema, createProjectSchema } from "@/lib/jsonld";
import { getProjectBySlug, getProjects } from "@/lib/projects";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

const BUILD_LABEL: Record<string, string> = {
  live: "Live",
  wip: "Work in progress",
  archived: "Archived",
};

function buildDotClass(status: string): string {
  if (status === "live") return "bg-green-500";
  if (status === "wip") return "bg-amber-500";
  return "bg-md-outline";
}

interface ProjectParams {
  params: { projectSlug: string };
}

export async function generateStaticParams() {
  try {
    const all = await getProjects({ onlyPublished: true });
    return all.map((p) => ({ projectSlug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: ProjectParams): Promise<Metadata> {
  const project = await getProjectBySlug(params.projectSlug);
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";
  if (!project) return { title: "Project" };
  const description = project.tagline || "";
  const imageUrl = project.thumbnail
    ? project.thumbnail.startsWith("http")
      ? project.thumbnail
      : `${baseUrl}${project.thumbnail}`
    : null;
  return {
    title: `${project.title} | Projects`,
    description,
    alternates: { canonical: `/projects/${params.projectSlug}` },
    openGraph: {
      title: project.title,
      description,
      url: `${baseUrl}/projects/${params.projectSlug}`,
      type: "website",
      images: imageUrl ? [{ url: imageUrl, alt: project.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProjectPage({ params }: ProjectParams) {
  const project = await getProjectBySlug(params.projectSlug);

  if (!project || project.status !== "published") {
    return (
      <div className="p-8">
        <div className="text-md-on-surface-variant">
          This project doesn't exist.
        </div>
      </div>
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";
  const projectUrl = `${baseUrl}/projects/${params.projectSlug}`;
  const imageUrl = project.thumbnail
    ? project.thumbnail.startsWith("http")
      ? project.thumbnail
      : `${baseUrl}${project.thumbnail}`
    : undefined;

  const jsonLd = [
    createProjectSchema({
      name: project.title,
      url: projectUrl,
      description: project.tagline || undefined,
      image: imageUrl,
      repoUrl: project.repoUrl,
      liveUrl: project.liveUrl,
      techTags: project.techTags,
    }),
    createBreadcrumbSchema([
      { name: "Home", url: baseUrl },
      { name: "Projects", url: `${baseUrl}/projects` },
      { name: project.title, url: projectUrl },
    ]),
  ];

  const related = project.posts ?? [];

  return (
    <div className="pt-12 sm:pt-16 md:pt-24 pb-24 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/projects"
        className="group inline-flex items-center gap-2 md-label-large text-md-on-surface-variant hover:text-md-on-surface transition-colors mb-10 md:mb-16"
      >
        <Icon
          name="arrow_back"
          size={18}
          className="text-primary/60 group-hover:text-primary transition-colors"
        />
        projects
      </Link>

      <header className="mb-10 md:mb-14 max-w-2xl">
        <div className="flex items-center gap-1.5 mb-4 md-label-medium uppercase tracking-wider text-md-on-surface-variant">
          <span
            className={`w-1.5 h-1.5 rounded-full ${buildDotClass(project.buildStatus)}`}
          />
          {BUILD_LABEL[project.buildStatus] ?? project.buildStatus}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-[44px] md:leading-[52px] font-normal tracking-tight text-md-on-surface">
          {project.title}
        </h1>

        {project.tagline && (
          <p className="mt-5 text-lg md:text-xl leading-relaxed text-md-on-surface-variant">
            {project.tagline}
          </p>
        )}

        {project.techTags && project.techTags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-1.5">
            {project.techTags.map((t) => (
              <span
                key={t}
                className="md-label-small text-md-on-surface-variant border border-md-outline-variant rounded-full px-2.5 py-0.5"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {(project.repoUrl || project.liveUrl) && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-md-primary text-md-on-primary md-label-large hover:shadow-md-1 hover:brightness-105 transition-all duration-200 ease-md-standard"
              >
                <Icon name="open_in_new" size={18} />
                Live
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-md-outline text-md-on-surface md-label-large hover:bg-md-surface-container transition-all duration-200 ease-md-standard"
              >
                <Icon name="code" size={18} />
                Source
              </a>
            )}
          </div>
        )}
      </header>

      {project.content && (
        <div
          className="article-content max-w-2xl mb-16"
          dangerouslySetInnerHTML={{ __html: project.content }}
        />
      )}

      {related.length > 0 && (
        <section className="max-w-2xl">
          <h2 className="md-label-medium uppercase tracking-widest text-md-on-surface-variant mb-4 block pb-3 border-b border-md-outline-variant">
            Read the story
          </h2>
          <div className="flex flex-col">
            {related.map((post) => (
              <Link
                key={post.slug}
                href={`/posts/${post.slug}`}
                className="group grid grid-cols-[auto_1fr] gap-4 -mx-3 px-3 py-4 rounded-xl border-b border-md-outline-variant hover:bg-md-surface-container-low transition-colors duration-200 ease-md-standard"
              >
                <Icon
                  name="article"
                  size={18}
                  className="text-primary/50 group-hover:text-primary transition-colors pt-0.5"
                />
                <div className="min-w-0">
                  <h3 className="md-title-medium font-medium text-md-on-surface group-hover:text-primary transition-colors duration-200">
                    {post.title}
                  </h3>
                  {post.description && (
                    <p className="mt-1 md-body-medium text-md-on-surface-variant line-clamp-2">
                      {post.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
