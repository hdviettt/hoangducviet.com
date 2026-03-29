import PostForm from "@/components/admin/PostForm";
import { db } from "@/db";
import { postCategories, projects } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const [categories, allProjects] = await Promise.all([
    db.select().from(postCategories),
    db.select({ slug: projects.slug, title: projects.title }).from(projects).orderBy(desc(projects.dateCreated)),
  ]);

  return <PostForm allCategories={categories} allProjects={allProjects} />;
}
