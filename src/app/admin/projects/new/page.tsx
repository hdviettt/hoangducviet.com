import ProjectForm from "@/components/admin/ProjectForm";
import { db } from "@/db";
import { posts, projectGroups } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const [allPosts, allGroups] = await Promise.all([
    db
      .select({ slug: posts.slug, title: posts.title })
      .from(posts)
      .where(eq(posts.status, "published")),
    db
      .select()
      .from(projectGroups)
      .orderBy(asc(projectGroups.sortOrder), asc(projectGroups.title)),
  ]);

  return (
    <div>
      <h1 className="text-xl font-medium mb-6">New Project</h1>
      <ProjectForm allPosts={allPosts} allGroups={allGroups} />
    </div>
  );
}
