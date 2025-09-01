import Link from "next/link";
import type { Metadata } from "next";

import { getGlobalMetadata } from "@/lib/directus";
import { getProjects, type Project } from "@/lib/projects";
import Container from "@/components/Container";

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobalMetadata();
  return {
    title: `Projects - VIET`,
    description: "Browse our collection of projects and case studies.",
  }
}

export default async function ProjectsPage() {
  let projects: Project[] = [];
  let errorMessage: string | null = null;
  
  try {
    projects = await getProjects({
      fields: ["*", "thumbnail.filename_disk", "thumbnail.height", "thumbnail.width", "posts.posts_slug"],
    });
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    errorMessage = error?.message || 'Failed to load projects';
  }

  return (
    <>
      <section className="py-24">
        <Container className="max-w-4xl">
          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Projects</h1>
            <p className="text-lg text-muted-foreground">
              Explore our portfolio of work and case studies
            </p>
          </header>
          
          {errorMessage ? (
            <div className="text-center py-12 px-4 rounded-lg border border-amber-200 bg-amber-50">
              <p className="text-amber-900 mb-2 font-medium">Unable to load projects</p>
              <p className="text-sm text-amber-800">
                Error: {errorMessage}
              </p>
              <p className="text-xs text-amber-700 mt-2">
                Please check the console for more details.
              </p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No projects available yet.</p>
              <p className="text-sm text-muted-foreground">Check back soon for updates!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {projects.map((project) => {
                const postCount = Array.isArray(project.posts) ? project.posts.length : 0;
                
                return (
                  <article 
                    key={project.slug} 
                    className="group relative rounded-lg border bg-card p-6 hover:shadow-md transition-all duration-200"
                  >
                    <Link href={`/projects/${project.slug}`}>
                      <span className="absolute inset-0" />
                      <div className="space-y-3">
                        <h2 className="text-2xl font-semibold leading-tight">
                          {project.title}
                        </h2>
                        {project.description && (
                          <p className="text-muted-foreground line-clamp-2">
                            {project.description.replace(/<[^>]*>/g, ' ').substring(0, 200)}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {project.date_created &&
                              new Date(project.date_created).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                          </span>
                          {postCount > 0 && (
                            <>
                              <span>•</span>
                              <span>{postCount} {postCount === 1 ? 'post' : 'posts'}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}