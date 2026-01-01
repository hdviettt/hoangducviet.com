import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
// import { getGlobalMetadata } from "@/lib/directus";
import { getProjectBySlug } from "@/lib/projects";


interface ProjectParams {
  params: {
    projectSlug: string;
  }
}

export async function generateMetadata({ params }: ProjectParams): Promise<Metadata> {
  try {
    const project = await getProjectBySlug(params.projectSlug, {
      fields: ["title"],
    });
    // const global = await getGlobalMetadata();
    return {
      title: `${project.title}`,
    }
  } catch (error) {
    return {
      title: "Project",
    }
  }
}

export default async function ProjectPage({ params }: ProjectParams) {
  let project: any = null;
  let posts: any[] = [];

  try {
    // Fetch project with expanded posts relationship through the junction table
    project = await getProjectBySlug(params.projectSlug, {
      fields: [
        "title",
        "description",
        "date_created",
        "posts.posts_slug.slug",
        "posts.posts_slug.title",
        "posts.posts_slug.date_created"
      ],
    });

    // Extract posts from the many-to-many relationship
    if (project.posts && Array.isArray(project.posts)) {
      posts = project.posts
        .map((junction: any) => junction.posts_slug)
        .filter((post: any) => post && typeof post === 'object');
    }
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
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-12 pb-20 md:pb-16">
        {/* Back button */}
        <Link
          href="/projects"
          className="inline-block text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          Back to projects
        </Link>

        <div className="flex gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Project Header */}
            <header className="mb-12 pb-8 border-b border-border scroll-fade-in">
              <h1 className="text-3xl font-semibold mb-4 text-foreground">{project.title}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <time dateTime={project.date_created} className="text-sm text-muted-foreground">
                  {project.date_created &&
                    new Date(project.date_created).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                </time>
              </div>
            </header>

            {/* Project Description */}
            {project.description && (
              <div
                className="article-content mb-10"
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
            )}

            {/* Related Posts */}
            {posts.length > 0 && (
              <section className="mt-10 pt-8 border-t border-border">
                <h2 className="text-base font-semibold mb-5 text-foreground">
                  Related Articles
                </h2>
                <div className="space-y-3">
                  {posts.map((post: any) => (
                    <Link
                      key={post.slug}
                      href={`/posts/${post.slug}`}
                      className="flex items-center justify-between px-4 py-3 bg-card border border-border hover:bg-muted transition-colors duration-75 group"
                    >
                      <span className="text-sm text-foreground">
                        {post.title}
                      </span>
                      <div className="text-[11px] text-muted-foreground">
                        {post.date_created &&
                          new Date(post.date_created).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {posts.length === 0 && (
              <div className="mt-10 p-6 bg-muted/20 text-center border border-border">
                <p className="text-foreground text-xs text-muted-foreground">No related articles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}