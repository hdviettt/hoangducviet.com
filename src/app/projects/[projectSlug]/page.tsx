import { getProjectBySlug } from "@/lib/projects";
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface ProjectParams {
  params: {
    projectSlug: string;
  };
}

export async function generateMetadata({
  params,
}: ProjectParams): Promise<Metadata> {
  try {
    const project = await getProjectBySlug(params.projectSlug);
    return {
      title: `${project.title}`,
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

  return (
    <div className="py-8 sm:py-12 md:py-16">
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

          <div className="space-y-px">
            {posts.map((post: any, index: number) => {
              const d = post.date_created ? new Date(post.date_created) : null;
              const date = d
                ? `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`
                : "";

              return (
                <Link
                  key={post.slug}
                  href={`/posts/${post.slug}`}
                  className="group flex gap-4 md:gap-6 py-4 border-b border-border/50 hover:border-primary/30 transition-colors"
                >
                  {/* Index */}
                  <span className="text-xs text-muted-foreground/40 font-mono w-6 shrink-0 pt-0.5 text-right">
                    {String(posts.length - index).padStart(2, "0")}
                  </span>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 mb-1">
                      <span className="text-foreground font-medium group-hover:text-primary transition-colors text-sm md:text-base leading-snug">
                        {post.title}
                      </span>
                      {date && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {date}
                        </span>
                      )}
                    </div>
                    {post.description && (
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {post.description}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
