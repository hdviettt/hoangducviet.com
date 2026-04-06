import { getProjectBySlug, getProjects } from "@/lib/projects";
import { getGlobalMetadata } from "@/lib/global";
import { createBreadcrumbSchema } from "@/lib/jsonld";
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

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

      {/* Related Posts */}
      {posts.length > 0 && (
        <section className="mt-10 pt-8 border-t border-border">
          <h2 className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground mb-6">
            Posts in this project
          </h2>

          <ul className="space-y-2 md:space-y-3">
            {posts.map((post: any) => {
              const d = post.date_created ? new Date(post.date_created) : null;
              const date = d
                ? `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`
                : "";

              return (
                <li key={post.slug}>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-1.5 md:py-2 group text-sm md:text-base"
                  >
                    <span className="text-muted-foreground/50 text-xs md:text-sm w-24 shrink-0 order-2 sm:order-1">
                      {date}
                    </span>
                    <span className="text-foreground group-hover:text-primary transition-colors order-1 sm:order-2">
                      {post.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
