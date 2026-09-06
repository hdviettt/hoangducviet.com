import WorkForm from "@/components/admin/WorkForm";
import { db } from "@/db";
import { posts, projectPosts, projects } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface Params {
  params: { slug: string };
}

export default async function EditWorkPage({ params }: Params) {
  const [rows, allPosts, allProjects, linked] = await Promise.all([
    db.select().from(projects).where(eq(projects.slug, params.slug)).limit(1),
    db
      .select({ slug: posts.slug, title: posts.title })
      .from(posts)
      .orderBy(desc(posts.dateCreated)),
    db
      .select({ slug: projects.slug, title: projects.title })
      .from(projects)
      .orderBy(asc(projects.sortOrder)),
    db
      .select({ postSlug: projectPosts.postSlug })
      .from(projectPosts)
      .where(eq(projectPosts.projectSlug, params.slug)),
  ]);

  if (!rows.length) notFound();
  const p = rows[0];

  return (
    <div>
      <h1 className="mb-6 text-xl font-medium">Edit project</h1>
      <WorkForm
        isEdit
        allPosts={allPosts}
        allProjects={allProjects}
        initialData={{
          slug: p.slug,
          title: p.title,
          description: p.description ?? "",
          content: p.content ?? "",
          thumbnail: p.thumbnail ?? "",
          parentSlug: p.parentSlug ?? "",
          status: p.status,
          buildStatus: p.buildStatus,
          featured: p.featured,
          sortOrder: p.sortOrder,
          stack: p.stack ?? [],
          models: p.models ?? [],
          media: p.media ?? [],
          postSlugs: linked.map((l) => l.postSlug),
        }}
      />
    </div>
  );
}
