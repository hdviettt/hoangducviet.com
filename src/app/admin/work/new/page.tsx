import WorkForm from "@/components/admin/WorkForm";
import { db } from "@/db";
import { posts, projects } from "@/db/schema";
import { asc, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function NewWorkPage() {
  const [allPosts, allProjects] = await Promise.all([
    // Any status: a project may link a draft build-log (e.g. the quoting agent).
    db.select({ slug: posts.slug, title: posts.title }).from(posts).orderBy(desc(posts.dateCreated)),
    db.select({ slug: projects.slug, title: projects.title }).from(projects).orderBy(asc(projects.sortOrder)),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-medium">New project</h1>
      <WorkForm allPosts={allPosts} allProjects={allProjects} />
    </div>
  );
}
