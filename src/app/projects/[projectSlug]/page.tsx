import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

import { getProjectBySlug } from "@/lib/projects";

export const runtime = "edge";

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
    return {
      title: `${project.title} - VIET`,
    }
  } catch (error) {
    return {
      title: "Project - VIET",
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
      <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fadeIn">
        {/* Back button */}
        <Link 
          href="/projects" 
          className="inline-block text-xs text-white hover:bg-white hover:text-black px-2 py-1 mb-8 transition-colors border border-white font-mono uppercase"
        >
          [Back]
        </Link>

        {/* Project Header */}
        <header className="mb-6 md:mb-10 pb-4 md:pb-6 border-b border-border/20">
          <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 text-foreground">{project.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <time dateTime={project.date_created} className="font-mono text-xs">
              {project.date_created &&
                new Date(project.date_created).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
            </time>
            <span className="text-white">|</span>
            <span className="px-2 py-1 bg-black text-white border border-white text-xs font-mono uppercase">
              Project
            </span>
          </div>
        </header>

        {/* Project Description */}
        {project.description && (
          <div 
            className="prose prose-invert prose-sm md:prose-lg max-w-none mb-8 md:mb-12
              prose-headings:font-bold prose-headings:text-foreground prose-headings:mb-6
              prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
              prose-strong:text-foreground prose-strong:font-semibold
              prose-code:text-blue-400 prose-code:bg-secondary/50 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm
              prose-pre:bg-secondary/30 prose-pre:border prose-pre:border-border/20 prose-pre:rounded-lg
              prose-blockquote:border-l-4 prose-blockquote:border-blue-400/50 prose-blockquote:pl-6 prose-blockquote:italic
              prose-ul:text-muted-foreground prose-ol:text-muted-foreground
              prose-li:marker:text-blue-400/50 prose-li:mb-2
              prose-hr:border-border/20 prose-hr:my-8"
            dangerouslySetInnerHTML={{ __html: project.description }}
          />
        )}

        {/* Related Posts */}
        {posts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-white uppercase">
              Related Articles
            </h2>
            <div className="space-y-3">
              {posts.map((post: any) => (
                <Link
                  key={post.slug}
                  href={`/posts/${post.slug}`}
                  className="flex items-center px-3 md:px-4 py-2 md:py-3 bg-black hover:bg-white hover:text-black transition-colors group border border-white"
                >
                  <span className="text-xs font-mono mr-3">[F]</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
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
          <div className="mt-8 md:mt-12 p-6 md:p-10 bg-black text-center border md:border-2 border-white">
            <p className="text-white font-mono text-sm md:text-base uppercase">No related articles</p>
          </div>
        )}
      </div>
    </div>
  );
}