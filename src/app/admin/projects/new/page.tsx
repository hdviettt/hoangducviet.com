import ProjectForm from "@/components/admin/ProjectForm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const allPosts = await db
    .select({ slug: posts.slug, title: posts.title })
    .from(posts)
    .where(eq(posts.status, "published"));

  return (
    <div>
      <h1 className="text-xl font-medium mb-6">New Project</h1>
      <ProjectForm allPosts={allPosts} />
    </div>
  );
}
