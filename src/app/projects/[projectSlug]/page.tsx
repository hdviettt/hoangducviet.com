import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
// import { getGlobalMetadata } from "@/lib/directus";
import { getProjectBySlug } from "@/lib/projects";

export const runtime = 'edge';

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
      <div className="max-w-2xl mx-auto px-8 md:px-16 lg:px-24 py-8 md:py-12 pb-20 md:pb-16 animate-fadeIn">
        {/* Back button */}
        <Link
          href="/projects"
          className="inline-block text-xs text-primary-foreground px-3 py-1.5 mb-8 transition-all border border-border rounded-md bg-primary hover:bg-primary/90 font-medium"
        >
          ← Back
        </Link>

        {/* Project Header */}
        <header className="mb-8 pb-6 border-b border-border">
          <h1 className="text-xl md:text-2xl font-semibold mb-4 text-foreground">{project.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <time dateTime={project.date_created} className="text-[11px] bg-muted/30 px-2 py-1 rounded-md border border-border text-muted-foreground">
              {project.date_created &&
                new Date(project.date_created).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
            </time>
            <span className="px-2 py-1 bg-primary text-primary-foreground border border-border text-[11px] rounded-md">
              Project
            </span>
          </div>
        </header>

        {/* Project Description */}
        {project.description && (
          <div
            className="prose prose-base max-w-none mb-10
              prose-headings:font-semibold prose-headings:text-foreground prose-headings:mb-4 prose-headings:mt-8
              prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
              prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4 prose-p:text-sm
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
              prose-strong:text-foreground prose-strong:font-semibold
              prose-code:text-primary prose-code:bg-muted/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:border prose-code:border-border
              prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-4 prose-pre:text-xs
              prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:bg-muted/20 prose-blockquote:py-2 prose-blockquote:my-4 prose-blockquote:text-sm
              prose-ul:text-foreground prose-ul:text-sm prose-ul:mb-4 prose-ol:text-foreground prose-ol:text-sm prose-ol:mb-4
              prose-li:marker:text-primary prose-li:mb-1
              prose-hr:border-border prose-hr:border prose-hr:my-6
              prose-img:border prose-img:border-border prose-img:rounded-lg"
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
                  className="flex items-center px-4 py-3 bg-card border border-border rounded-md hover:shadow-sm hover:border-primary/20 transition-all group"
                >
                  <span className="text-xs mr-3 text-primary">→</span>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-foreground">
                      {post.title}
                    </div>
                  </div>
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
          <div className="mt-10 p-6 bg-muted/20 text-center border border-border rounded-lg">
            <p className="text-foreground text-xs text-muted-foreground">No related articles</p>
          </div>
        )}
      </div>
    </div>
  );
}