import PostForm from "@/components/admin/PostForm";
import { db } from "@/db";
import { postCategories } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const categories = await db.select().from(postCategories);

  return (
    <div>
      <h1 className="text-xl font-medium mb-6">New Post</h1>
      <PostForm allCategories={categories} />
    </div>
  );
}
