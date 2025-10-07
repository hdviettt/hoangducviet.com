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
      <div className="max-w-3xl mx-auto p-6 md:p-12 pb-20 md:pb-12 animate-fadeIn">
        {/* Back button */}
        <Link
          href="/projects"
          className="inline-block text-[10px] text-primary-foreground px-3 py-1.5 mb-8 transition-all border-2 border-border rounded-md bg-primary shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none font-mono uppercase font-bold"
        >
          ← Back
        </Link>

        {/* Project Header */}
        <header className="mb-8 pb-6 border-b-2 border-border">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-foreground uppercase">{project.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <time dateTime={project.date_created} className="font-mono text-[9px] bg-muted/30 px-2 py-1 rounded-md border-2 border-border uppercase">
              {project.date_created &&
                new Date(project.date_created).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
            </time>
            <span className="px-2 py-1 bg-primary text-primary-foreground border-2 border-border text-[9px] font-mono uppercase rounded-md shadow-neo-sm">
              Project
            </span>
          </div>
        </header>

        {/* Project Description */}
        {project.description && (
          <div
            className="prose prose-base max-w-none mb-10
              prose-headings:font-bold prose-headings:text-foreground prose-headings:mb-4 prose-headings:mt-8 prose-headings:uppercase
              prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
              prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4 prose-p:text-sm
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
              prose-strong:text-foreground prose-strong:font-bold
              prose-code:text-primary prose-code:bg-muted/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:border prose-code:border-border prose-code:font-mono
              prose-pre:bg-card prose-pre:border-2 prose-pre:border-border prose-pre:rounded-lg prose-pre:shadow-neo-sm prose-pre:p-4 prose-pre:text-xs
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:bg-muted/20 prose-blockquote:py-2 prose-blockquote:my-4 prose-blockquote:text-sm
              prose-ul:text-foreground prose-ul:text-sm prose-ul:mb-4 prose-ol:text-foreground prose-ol:text-sm prose-ol:mb-4
              prose-li:marker:text-primary prose-li:mb-1
              prose-hr:border-border prose-hr:border-2 prose-hr:my-6
              prose-img:border-2 prose-img:border-border prose-img:rounded-lg prose-img:shadow-neo-sm"
            dangerouslySetInnerHTML={{ __html: project.description }}
          />
        )}

        {/* Related Posts */}
        {posts.length > 0 && (
          <section className="mt-10 pt-8 border-t-2 border-border">
            <h2 className="text-lg font-bold mb-4 text-foreground uppercase">
              Related Articles
            </h2>
            <div className="space-y-2">
              {posts.map((post: any) => (
                <Link
                  key={post.slug}
                  href={`/posts/${post.slug}`}
                  className="flex items-center px-3 py-2 bg-card border-2 border-border rounded-md shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all group"
                >
                  <span className="text-[10px] font-mono mr-2 text-primary">[F]</span>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-foreground">
                      {post.title}
                    </div>
                  </div>
                  <div className="text-[9px] text-muted-foreground font-mono">
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
          <div className="mt-10 p-6 bg-muted/20 text-center border-2 border-border rounded-lg">
            <p className="text-foreground font-mono text-[10px] uppercase font-bold">No related articles</p>
          </div>
        )}
      </div>
    </div>
  );
}