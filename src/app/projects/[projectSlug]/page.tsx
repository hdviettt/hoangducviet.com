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

  return (
    <div className="py-8 sm:py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Back button */}
      <Link
        href="/projects"
        className="inline-block text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
      >
        ← Back to projects
      </Link>

      {/* Project Header */}
      <header className="mb-8 sm:mb-10">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-medium mb-3 leading-tight">
          {project.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4">
          <time
            dateTime={project.date_created ?? ""}
            className="text-xs sm:text-sm text-muted-foreground"
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
              className="inline-flex items-center gap-1 text-xs sm:text-sm text-primary hover:underline transition-colors"
            >
              {(() => {
                try {
                  return new URL(project.url).hostname;
                } catch {
                  return project.url;
                }
              })()}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </header>

      {/* Project Content */}
      {project.description && (
        <div
          className="article-content mb-10"
          dangerouslySetInnerHTML={{ __html: project.description }}
        />
      )}

      {/* Related Posts — rendered as a series index when 2+ posts exist */}
      {posts.length > 0 && (
        <section className="mt-10 pt-8 border-t border-border">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6">
            {posts.length >= 2 ? `Series · ${posts.length} parts` : "Posts in this project"}
          </h2>

          <ol className="space-y-1 md:space-y-1.5">
            {posts.map((post: any, i: number) => {
              const d = post.date_created ? new Date(post.date_created) : null;
              const date = d
                ? d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                  })
                : "";
              const cleanTitle = (post.title || "").replace(/^.*?#\d+:\s*/, "");
              const isSeries = posts.length >= 2;

              return (
                <li key={post.slug}>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="flex items-baseline gap-3 sm:gap-4 py-2 group text-sm md:text-base"
                  >
                    {isSeries && (
                      <span className="font-mono text-xs tabular-nums text-muted-foreground/60 w-8 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    )}
                    <span className="text-foreground group-hover:text-primary transition-colors flex-1 min-w-0">
                      {isSeries ? cleanTitle : post.title}
                    </span>
                    <span className="text-muted-foreground/50 text-xs font-mono tabular-nums shrink-0">
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
