import PostForm from "@/components/admin/PostForm";
import { db } from "@/db";
import { postCategories, posts, postsCategories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface Params {
  params: { slug: string };
}

export default async function EditPostPage({ params }: Params) {
  const [postResult, categories, postCats] = await Promise.all([
    db.select().from(posts).where(eq(posts.slug, params.slug)).limit(1),
    db.select().from(postCategories),
    db
      .select({ categorySlug: postsCategories.categorySlug })
      .from(postsCategories)
      .innerJoin(posts, eq(postsCategories.postId, posts.id))
      .where(eq(posts.slug, params.slug)),
  ]);

  if (!postResult.length) {
    notFound();
  }

  const post = postResult[0];

  return (
    <PostForm
      initialData={{
        slug: post.slug,
        title: post.title,
        description: post.description ?? "",
        content: post.content ?? "",
        thumbnail: post.thumbnail ?? "",
        status: post.status,
        categories: postCats.map((c) => c.categorySlug),
      }}
      allCategories={categories}
      isEdit
    />
  );
}
