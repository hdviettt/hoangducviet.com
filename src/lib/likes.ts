import { db } from "@/db";
import { postLikes, posts } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export interface LikeState {
  liked: boolean;
  count: number;
}

/**
 * Reads `(liked, count)` for a given post and anonymous visitor.
 * `anonId` may be null when the visitor has no `pb_anon` cookie yet — in that
 * case `liked` is always false but `count` is still returned.
 */
export async function getLikeState(
  postId: number,
  anonId: string | null,
): Promise<LikeState> {
  const post = await db
    .select({ count: posts.likeCount })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);
  const count = post[0]?.count ?? 0;

  if (!anonId) return { liked: false, count };

  const existing = await db
    .select({ postId: postLikes.postId })
    .from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.anonId, anonId)))
    .limit(1);

  return { liked: existing.length > 0, count };
}

/**
 * Toggles a like for `(postId, anonId)`. Insert + increment, or delete + decrement,
 * in a single transaction so the denormalized counter on `posts` stays in sync
 * with the `post_likes` table.
 */
export async function toggleLike(
  postId: number,
  anonId: string,
): Promise<LikeState> {
  return db.transaction(async (tx) => {
    const existing = await tx
      .select({ postId: postLikes.postId })
      .from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.anonId, anonId)))
      .limit(1);

    if (existing.length > 0) {
      await tx
        .delete(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.anonId, anonId)));
      const result = await tx
        .update(posts)
        .set({ likeCount: sql`GREATEST(${posts.likeCount} - 1, 0)` })
        .where(eq(posts.id, postId))
        .returning({ count: posts.likeCount });
      return { liked: false, count: result[0]?.count ?? 0 };
    }

    await tx.insert(postLikes).values({ postId, anonId });
    const result = await tx
      .update(posts)
      .set({ likeCount: sql`${posts.likeCount} + 1` })
      .where(eq(posts.id, postId))
      .returning({ count: posts.likeCount });
    return { liked: true, count: result[0]?.count ?? 0 };
  });
}
