import { getProjectBySlug } from "@/lib/projects";
import type { Metadata } from "next";
import Link from "next/link";

interface ProjectParams {
  params: { projectSlug: string };
}

export async function generateMetadata({
  params,
}: ProjectParams): Promise<Metadata> {
  try {
    const project = await getProjectBySlug(params.projectSlug);
    return { title: project.title };
  } catch {
    return { title: "Project" };
  }
}

export default async function ProjectPage({ params }: ProjectParams) {
  let project: any = null;
  let posts: any[] = [];

  try {
    project = await getProjectBySlug(params.projectSlug);
    posts = project.posts ?? [];
  } catch (error) {
    console.error("Error fetching project:", error);
  }

  if (!project) {
    return <p className="text-neutral-500">Project not found</p>;
  }

  return (
    <div>
      <Link
        href="/projects"
        className="text-sm text-neutral-400 hover:text-neutral-600 mb-8 inline-block"
      >
        ← back
      </Link>

      <h1 className="text-2xl font-semibold mb-2">{project.title}</h1>
      <time className="text-sm text-neutral-400">
        {project.date_created &&
          new Date(project.date_created).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
      </time>

      {project.description && (
        <div
          className="prose-blog mt-6"
          dangerouslySetInnerHTML={{ __html: project.description }}
        />
      )}

      {posts.length > 0 && (
        <section className="mt-10 pt-6 border-t border-neutral-200">
          <h2 className="text-sm font-semibold text-neutral-400 mb-3">Related Posts</h2>
          <ul className="space-y-1">
            {posts.map((post: any) => (
              <li key={post.slug}>
                <Link
                  href={`/posts/${post.slug}`}
                  className="text-blue-600 hover:underline"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
