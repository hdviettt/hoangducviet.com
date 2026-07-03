import WorkForm from "@/components/admin/WorkForm";
import { db } from "@/db";
import { posts, projectPosts, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Params {
  params: { slug: string };
}

export default async function EditWorkPage({ params }: Params) {
  const [rows, related, allPosts] = await Promise.all([
    db.select().from(projects).where(eq(projects.slug, params.slug)).limit(1),
    db
      .select({ postSlug: projectPosts.postSlug })
      .from(projectPosts)
      .where(eq(projectPosts.projectSlug, params.slug)),
    db
      .select({ slug: posts.slug, title: posts.title })
      .from(posts)
      .where(eq(posts.status, "published")),
  ]);

  if (!rows.length) notFound();
  const p = rows[0];

  const initialData = {
    slug: p.slug,
    title: p.title,
    tagline: p.tagline ?? "",
    content: p.content ?? "",
    thumbnail: p.thumbnail ?? "",
    repoUrl: p.repoUrl ?? "",
    liveUrl: p.liveUrl ?? "",
    techTags: p.techTags ?? [],
    status: p.status,
    buildStatus: p.buildStatus,
    featured: p.featured,
    sortOrder: p.sortOrder,
    postSlugs: related.map((r) => r.postSlug),
  };

  return (
    <div>
      <h1 className="text-xl font-medium mb-6">Edit Project</h1>
      <WorkForm allPosts={allPosts} initialData={initialData} isEdit />
    </div>
  );
}
