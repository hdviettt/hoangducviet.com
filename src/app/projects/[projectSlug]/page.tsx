import { getProjectBySlug, getProjects } from "@/lib/projects";
import { getGlobalMetadata } from "@/lib/global";
import { createBreadcrumbSchema } from "@/lib/jsonld";
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const allProjects = await getProjects();
    return allProjects.map((project) => ({ projectSlug: project.slug }));
  } catch {
    return [];
  }
}

interface ProjectParams {
  params: {
    projectSlug: string;
  };
}

export async function generateMetadata({
  params,
}: ProjectParams): Promise<Metadata> {
  try {
    const [project, globalData] = await Promise.all([
      getProjectBySlug(params.projectSlug),
      getGlobalMetadata(),
    ]);
    const siteTitle =
      globalData && globalData.length > 0 ? globalData[0].title : "Blog";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";
    const thumbnailUrl = project.thumbnail
      ? project.thumbnail.startsWith("http") ? project.thumbnail : `${baseUrl}${project.thumbnail}`
      : null;
    const projectUrl = `${baseUrl}/projects/${params.projectSlug}`;
    const description = project.summary || "";

    return {
      title: `${project.title} | ${siteTitle}`,
      description,
      alternates: { canonical: `/projects/${params.projectSlug}` },
      openGraph: {
        title: project.title,
        description,
        url: projectUrl,
        siteName: siteTitle,
        type: "website",
        images: thumbnailUrl
          ? [{ url: thumbnailUrl, alt: project.title }]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: project.title,
        description,
        images: thumbnailUrl ? [thumbnailUrl] : [],
      },
    };
  } catch (error) {
    return {
      title: "Project",
    };
  }
}

export default async function ProjectPage({ params }: ProjectParams) {
  let project: any = null;
  let posts: any[] = [];

  try {
    project = await getProjectBySlug(params.projectSlug);
    // Already sorted newest first from lib/projects.ts
    posts = project.posts ?? [];
  } catch (error) {
    console.error("Error fetching project:", error);
  }

  if (!project) {
    return (
      <div className="p-8">
        <div className="text-gray-500">Project not found</div>
      </div>
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";
  const projectUrl = `${baseUrl}/projects/${params.projectSlug}`;

  const jsonLd = createBreadcrumbSchema([
    { name: "Home", url: baseUrl },
    { name: "Projects", url: `${baseUrl}/projects` },
    { name: project.title || "", url: projectUrl },
  ]);

  const isSeries = posts.length >= 2;

  return (
    <div className="pt-12 sm:pt-16 md:pt-24 pb-24 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Back */}
      <Link
        href="/projects"
        className="inline-block text-sm text-muted-foreground hover:text-primary transition-colors mb-12 md:mb-20"
      >
        ← all projects
      </Link>

      {/* Project Header — deck-label + display title */}
      <header className="mb-16 sm:mb-20 md:mb-28">
        <span className="deck-label">
          {isSeries ? `series · ${posts.length} parts` : "project"}
        </span>
        <h1 className="deck-display text-5xl sm:text-6xl md:text-7xl mb-8 md:mb-10">
          {project.title}
        </h1>

        {project.summary && (
          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed max-w-2xl mb-6">
            {project.summary}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <time
            dateTime={project.date_created ?? ""}
            className="tabular-nums text-muted-foreground/70"
          >
            {project.date_created &&
              new Date(project.date_created).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
          </time>

          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline transition-colors"
            >
              {(() => {
                try {
                  return new URL(project.url).hostname;
                } catch {
                  return project.url;
                }
              })()}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </header>

      {/* Project Description */}
      {project.description && (
        <div
          className="article-content mb-20 max-w-2xl"
          dangerouslySetInnerHTML={{ __html: project.description }}
        />
      )}

      {/* Series parts — naked typographic list */}
      {posts.length > 0 && (
        <section className="mt-12 md:mt-20">
          <h2 className="deck-label">
            {isSeries ? "all parts" : "posts in this project"}
          </h2>

          <ol className="divide-y divide-border/50">
            {posts.map((post: any, i: number) => {
              const d = post.date_created ? new Date(post.date_created) : null;
              const date = d
                ? d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "";
              const cleanTitle = (post.title || "").replace(/^.*?#\d+:\s*/, "");

              return (
                <li key={post.slug}>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="flex items-baseline gap-5 md:gap-6 py-5 md:py-7 group"
                  >
                    {isSeries && (
                      <span className="text-base md:text-lg tabular-nums font-semibold text-primary/40 group-hover:text-primary transition-colors w-10 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    )}
                    <span className="flex-1 min-w-0 text-xl md:text-2xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {isSeries ? cleanTitle : post.title}
                    </span>
                    <span className="text-xs md:text-sm tabular-nums text-muted-foreground/60 shrink-0">
                      {date}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}
