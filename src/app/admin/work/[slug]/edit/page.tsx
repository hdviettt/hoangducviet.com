import WorkForm from "@/components/admin/WorkForm";
import { db } from "@/db";
import {
  postCategories,
  posts,
  projectPosts,
  projects,
  projectsCategories,
} from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface Params {
  params: { slug: string };
}

export default async function EditWorkPage({ params }: Params) {
  const [rows, allPosts, allProjects, linked, allCategories, tagged] =
    await Promise.all([
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
      db
        .select({ slug: postCategories.slug, title: postCategories.title })
        .from(postCategories)
        .orderBy(asc(postCategories.title)),
      db
        .select({ categorySlug: projectsCategories.categorySlug })
        .from(projectsCategories)
        .where(eq(projectsCategories.projectSlug, params.slug)),
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
        allCategories={allCategories}
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
          stack: p.stack ?? [],
          models: p.models ?? [],
          media: p.media ?? [],
          postSlugs: linked.map((l) => l.postSlug),
          categories: tagged.map((t) => t.categorySlug),
        }}
      />
    </div>
  );
}
