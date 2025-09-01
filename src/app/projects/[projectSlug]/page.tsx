import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

import { getGlobalMetadata } from "@/lib/directus";
import { getProjectBySlug } from "@/lib/projects";
import { getPostBySlug } from "@/lib/posts";
import Container from "@/components/Container";

interface ProjectParams {
  params: {
    projectSlug: string;
  }
}

export async function generateMetadata({ params }: ProjectParams): Promise<Metadata> {
  const global = await getGlobalMetadata();
  const project = await getProjectBySlug(params.projectSlug, {
    fields: ["title", "description"],
  });
  return {
    title: `${project.title} - VIET`,
    description: project.description || `Project: ${project.title}`,
  }
}

export default async function ProjectPage({ params }: ProjectParams) {
  // Fetch project with expanded posts relationship through the junction table
  const project = await getProjectBySlug(params.projectSlug, {
    fields: [
      "*", 
      "posts.posts_slug.*",
      "posts.posts_slug.thumbnail.filename_disk",
      "posts.posts_slug.thumbnail.height", 
      "posts.posts_slug.thumbnail.width"
    ],
  });

  // Extract posts from the many-to-many relationship
  let posts: any[] = [];
  if (project.posts && Array.isArray(project.posts)) {
    // The posts come through the junction table as posts[].posts_slug
    posts = project.posts
      .map((junction: any) => junction.posts_slug)
      .filter((post: any) => post && typeof post === 'object');
  }
  
  return (
    <>
      <article className="py-24">
        <Container className="max-w-4xl">
          <header className="mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
              {project.title}
            </h1>
            {project.description && (
              <div 
                className="prose prose-gray max-w-none text-lg prose-p:text-muted-foreground prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Created: {project.date_created &&
                  new Date(project.date_created).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
              </span>
              {project.date_updated && (
                <>
                  <span>•</span>
                  <span>
                    Updated: {new Date(project.date_updated).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </>
              )}
            </div>
          </header>

          {posts.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-8">Related Posts</h2>
              <div className="grid gap-8 md:grid-cols-2">
                {posts.map((post: any) => {
                  const thumbnailUrl = post.thumbnail && typeof post.thumbnail === 'object'
                    ? `${process.env.NEXT_PUBLIC_DIRECTUS_API_ENDPOINT}/assets/${post.thumbnail.filename_disk}`
                    : null;
                  
                  return (
                    <article 
                      key={post.id || post.slug} 
                      className="group relative rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-all duration-200"
                    >
                      <Link href={`/posts/${post.slug}`}>
                        <span className="absolute inset-0 z-10" />
                        {thumbnailUrl && post.thumbnail && typeof post.thumbnail === 'object' ? (
                          <div className="aspect-video relative overflow-hidden bg-muted">
                            <Image
                              src={thumbnailUrl}
                              alt={post.title || ''}
                              width={post.thumbnail.width || 600}
                              height={post.thumbnail.height || 400}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-muted flex items-center justify-center">
                            <span className="text-4xl font-bold text-muted-foreground/20">VIET</span>
                          </div>
                        )}
                        <div className="p-6 space-y-3">
                          <h3 className="text-xl font-semibold leading-tight line-clamp-2">
                            {post.title}
                          </h3>
                          {post.description && (
                            <p className="text-muted-foreground line-clamp-2">
                              {post.description}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {post.date_created &&
                              new Date(post.date_created).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                          </p>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {posts.length === 0 && (
            <div className="text-center py-12 border rounded-lg bg-muted/50">
              <p className="text-muted-foreground">No posts in this project yet.</p>
            </div>
          )}

          <div className="mt-12 pt-8 border-t">
            <Link 
              href="/projects" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to all projects
            </Link>
          </div>
        </Container>
      </article>
    </>
  );
}