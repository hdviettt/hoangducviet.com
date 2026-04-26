import PostForm from "@/components/admin/PostForm";
import { db } from "@/db";
import { postCategories, series } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const [categories, allProjects] = await Promise.all([
    db.select().from(postCategories),
    db.select({ slug: series.slug, title: series.title }).from(series).orderBy(desc(series.dateCreated)),
  ]);

  return <PostForm allCategories={categories} allProjects={allProjects} />;
}
