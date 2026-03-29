import PostForm from "@/components/admin/PostForm";
import { db } from "@/db";
import { postCategories, posts, postsCategories, projects, projectsPosts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface Params {
  params: { slug: string };
}

export default async function EditPostPage({ params }: Params) {
  const [postResult, categories, postCats, allProjects, postProject] = await Promise.all([
    db.select().from(posts).where(eq(posts.slug, params.slug)).limit(1),
    db.select().from(postCategories),
    db
      .select({ categorySlug: postsCategories.categorySlug })
      .from(postsCategories)
      .innerJoin(posts, eq(postsCategories.postId, posts.id))
      .where(eq(posts.slug, params.slug)),
    db.select({ slug: projects.slug, title: projects.title }).from(projects).orderBy(desc(projects.dateCreated)),
    db.select({ projectSlug: projectsPosts.projectSlug }).from(projectsPosts).where(eq(projectsPosts.postSlug, params.slug)).limit(1),
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
        projectSlug: postProject.length ? postProject[0].projectSlug : "",
      }}
      allCategories={categories}
      allProjects={allProjects}
      isEdit
    />
  );
}
