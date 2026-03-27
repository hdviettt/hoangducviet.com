import ProjectForm from "@/components/admin/ProjectForm";
import { db } from "@/db";
import { posts, projectGroups, projects, projectsPosts } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface Params {
  params: { slug: string };
}

export default async function EditProjectPage({ params }: Params) {
  const [projectResult, allPosts, linkedPosts, allGroups] = await Promise.all([
    db.select().from(projects).where(eq(projects.slug, params.slug)).limit(1),
    db
      .select({ slug: posts.slug, title: posts.title })
      .from(posts)
      .where(eq(posts.status, "published")),
    db
      .select({ postSlug: projectsPosts.postSlug })
      .from(projectsPosts)
      .where(eq(projectsPosts.projectSlug, params.slug)),
    db
      .select()
      .from(projectGroups)
      .orderBy(asc(projectGroups.sortOrder), asc(projectGroups.title)),
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
          url: project.url ?? "",
          summary: project.summary ?? "",
          description: project.description ?? "",
          thumbnail: project.thumbnail ?? "",
          status: project.status,
          groupSlug: project.groupSlug ?? "",
          postSlugs: linkedPosts.map((p) => p.postSlug),
        }}
        allPosts={allPosts}
        allGroups={allGroups}
        isEdit
      />
    </div>
  );
}
