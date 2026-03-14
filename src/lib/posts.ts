import { db } from "@/db";
import { postCategories, posts, postsCategories } from "@/db/schema";
import { and, desc, eq, gt, lt } from "drizzle-orm";

export interface Post {
  id?: number;
  slug?: string;
  title?: string;
  description?: string;
  content?: string;
  thumbnail?: string | null;
  status?: string;
  date_created?: string;
  categories?: Array<{ title: string }>;
}

interface GetPostsOptions {
  limit?: number;
  withCategories?: boolean;
}

export async function getPosts(
  options?: GetPostsOptions,
): Promise<Array<Post>> {
  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.dateCreated))
    .limit(options?.limit ?? 100);

  if (!options?.withCategories) {
    return result.map(mapPost);
  }

  // Fetch categories for all posts
  const postIds = result.map((p) => p.id);
  const cats = postIds.length
    ? await db
        .select({
          postId: postsCategories.postId,
          title: postCategories.title,
        })
        .from(postsCategories)
        .innerJoin(
          postCategories,
          eq(postsCategories.categorySlug, postCategories.slug),
        )
    : [];

  const catsByPostId = new Map<number, Array<{ title: string }>>();
  for (const cat of cats) {
    const existing = catsByPostId.get(cat.postId) ?? [];
    existing.push({ title: cat.title });
    catsByPostId.set(cat.postId, existing);
  }

  return result.map((row) => ({
    ...mapPost(row),
    categories: catsByPostId.get(row.id) ?? [],
  }));
}

export async function getPostBySlug(slug: string): Promise<Post> {
  if (!slug) throw new Error("Invalid slug");

  const result = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .limit(1);

  if (!result || result.length === 0) {
    throw new Error(`Post with slug "${slug}" not found`);
  }

  return mapPost(result[0]);
}

export async function getAdjacentPosts(currentSlug: string): Promise<{
  previous: Pick<Post, "slug" | "title"> | null;
  next: Pick<Post, "slug" | "title"> | null;
}> {
  // Get current post's date
  const current = await db
    .select({ dateCreated: posts.dateCreated })
    .from(posts)
    .where(and(eq(posts.slug, currentSlug), eq(posts.status, "published")))
    .limit(1);

  if (!current.length) {
    return { previous: null, next: null };
  }

  const currentDate = current[0].dateCreated;

  // Previous = older post (date < current, ordered desc, limit 1)
  const [previousResult, nextResult] = await Promise.all([
    db
      .select({ slug: posts.slug, title: posts.title })
      .from(posts)
      .where(
        and(eq(posts.status, "published"), lt(posts.dateCreated, currentDate)),
      )
      .orderBy(desc(posts.dateCreated))
      .limit(1),
    // Next = newer post (date > current, ordered asc, limit 1)
    db
      .select({ slug: posts.slug, title: posts.title })
      .from(posts)
      .where(
        and(eq(posts.status, "published"), gt(posts.dateCreated, currentDate)),
      )
      .orderBy(posts.dateCreated)
      .limit(1),
  ]);

  return {
    previous: previousResult.length ? previousResult[0] : null,
    next: nextResult.length ? nextResult[0] : null,
  };
}

function mapPost(row: typeof posts.$inferSelect): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? undefined,
    content: row.content ?? undefined,
    thumbnail: row.thumbnail,
    status: row.status,
    date_created: row.dateCreated?.toISOString(),
  };
}
