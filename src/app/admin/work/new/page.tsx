import WorkForm from "@/components/admin/WorkForm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function NewWorkPage() {
  const allPosts = await db
    .select({ slug: posts.slug, title: posts.title })
    .from(posts)
    .where(eq(posts.status, "published"));

  return (
    <div>
      <h1 className="text-xl font-medium mb-6">New Project</h1>
      <WorkForm allPosts={allPosts} />
    </div>
  );
}
