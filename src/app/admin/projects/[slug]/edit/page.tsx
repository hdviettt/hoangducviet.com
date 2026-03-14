import ProjectForm from "@/components/admin/ProjectForm";
import { db } from "@/db";
import { posts, projects, projectsPosts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface Params {
  params: { slug: string };
}

export default async function EditProjectPage({ params }: Params) {
  const [projectResult, allPosts, linkedPosts] = await Promise.all([
    db.select().from(projects).where(eq(projects.slug, params.slug)).limit(1),
    db
      .select({ slug: posts.slug, title: posts.title })
      .from(posts)
      .where(eq(posts.status, "published")),
    db
      .select({ postSlug: projectsPosts.postSlug })
      .from(projectsPosts)
      .where(eq(projectsPosts.projectSlug, params.slug)),
  ]);

  if (!projectResult.length) {
    notFound();
  }

  const project = projectResult[0];

  return (
    <div>
      <h1 className="text-xl font-medium mb-6">Edit Project</h1>
      <ProjectForm
        initialData={{
          slug: project.slug,
          title: project.title,
          description: project.description ?? "",
          thumbnail: project.thumbnail ?? "",
          status: project.status,
          postSlugs: linkedPosts.map((p) => p.postSlug),
        }}
        allPosts={allPosts}
        isEdit
      />
    </div>
  );
}
