import Link from "next/link";
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
        <time dateTime={project.date_created} className="text-xs sm:text-sm text-muted-foreground">
          {project.date_created &&
            new Date(project.date_created).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
        </time>
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
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
            Related Posts
          </h2>
          <ul className="space-y-2">
            {posts.map((post: any) => (
              <li key={post.slug}>
                <Link
                  href={`/posts/${post.slug}`}
                  className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-1.5 group text-sm"
                >
                  <span className="text-muted-foreground text-xs shrink-0 order-2 sm:order-1">
                    {post.date_created &&
                      new Date(post.date_created).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit'
                      })}
                  </span>
                  <span className="text-foreground group-hover:text-primary transition-colors order-1 sm:order-2">
                    {post.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}