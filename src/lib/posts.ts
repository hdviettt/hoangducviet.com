import { db } from "@/db";
import {
  postCategories,
  posts,
  postsCategories,
  series,
  seriesPosts,
} from "@/db/schema";
import { and, asc, desc, eq, gt, lt } from "drizzle-orm";

export interface Post {
  id?: number;
  slug?: string;
  title?: string;
  description?: string;
  content?: string;
  thumbnail?: string | null;
  status?: string;
  date_created?: string;
  date_updated?: string;
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
  // Use id (serial integer) to avoid timestamp microsecond precision issues
  const current = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.slug, currentSlug), eq(posts.status, "published")))
    .limit(1);

  if (!current.length) {
    return { previous: null, next: null };
  }

  const currentId = current[0].id;

  const [previousResult, nextResult] = await Promise.all([
    // Previous = lower id (older post)
    db
      .select({ slug: posts.slug, title: posts.title })
      .from(posts)
      .where(and(eq(posts.status, "published"), lt(posts.id, currentId)))
      .orderBy(desc(posts.id))
      .limit(1),
    // Next = higher id (newer post)
    db
      .select({ slug: posts.slug, title: posts.title })
      .from(posts)
      .where(and(eq(posts.status, "published"), gt(posts.id, currentId)))
      .orderBy(posts.id)
      .limit(1),
  ]);

  return {
    previous: previousResult.length ? previousResult[0] : null,
    next: nextResult.length ? nextResult[0] : null,
  };
}

export async function getSeriesForPost(
  postSlug: string,
): Promise<{ slug: string; title: string } | null> {
  try {
    const result = await db
      .select({
        slug: series.slug,
        title: series.title,
      })
      .from(seriesPosts)
      .innerJoin(series, eq(seriesPosts.seriesSlug, series.slug))
      .where(eq(seriesPosts.postSlug, postSlug))
      .limit(1);

    return result.length ? result[0] : null;
  } catch {
    return null;
  }
}

export interface SeriesContext {
  series: { slug: string; title: string };
  total: number;
  partNumber: number;
  parts: Array<{ slug: string; title: string }>;
  previous: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

// Feed items collapse multi-post series into a single series row so a
// chronological list isn't dominated by one series's parts. A standalone
// post (not in a series, or in a series with only 1 published post)
// renders as a `post` item; a series with 2+ published posts renders as
// a single `series` item with date range and part count. All dates are ISO
// strings so the type is safe to pass from server to client components.
export type FeedItem =
  | { kind: "post"; post: Post }
  | {
      kind: "series";
      series: {
        slug: string;
        title: string;
        summary: string | null;
      };
      parts: {
        slug: string;
        title: string;
        date_created: string;
        thumbnail: string | null;
        description: string | null;
      }[];
      firstDate: string;
      lastDate: string;
    };

export async function getFeedItems(options?: {
  limit?: number;
}): Promise<FeedItem[]> {
  // Pull all published posts with their (optional) series association.
  const rows = await db
    .select({
      post: posts,
      seriesSlug: series.slug,
      seriesTitle: series.title,
      seriesSummary: series.summary,
    })
    .from(posts)
    .leftJoin(seriesPosts, eq(seriesPosts.postSlug, posts.slug))
    .leftJoin(series, eq(series.slug, seriesPosts.seriesSlug))
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.dateCreated));

  // Primary category per post (first attached) — powers the feed's Scale-style
  // category column.
  const postIds = rows.map((r) => r.post.id);
  const catRows = postIds.length
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
  const primaryCategory = new Map<number, string>();
  for (const c of catRows) {
    if (!primaryCategory.has(c.postId)) primaryCategory.set(c.postId, c.title);
  }

  // Count published posts per series so we know which series qualify
  // (2+ posts).
  const seriesPostCount = new Map<string, number>();
  for (const r of rows) {
    if (r.seriesSlug) {
      seriesPostCount.set(
        r.seriesSlug,
        (seriesPostCount.get(r.seriesSlug) || 0) + 1,
      );
    }
  }

  const items: FeedItem[] = [];
  const seriesIndex = new Map<string, FeedItem & { kind: "series" }>();

  for (const r of rows) {
    const post = mapPost(r.post);
    const cat = primaryCategory.get(r.post.id);
    if (cat) post.categories = [{ title: cat }];
    const dateIso = (r.post.dateCreated as Date).toISOString();
    const isSeriesMember =
      r.seriesSlug != null &&
      r.seriesTitle != null &&
      (seriesPostCount.get(r.seriesSlug) || 0) >= 2;

    if (isSeriesMember && r.seriesSlug && r.seriesTitle) {
      let entry = seriesIndex.get(r.seriesSlug);
      if (!entry) {
        entry = {
          kind: "series",
          series: {
            slug: r.seriesSlug,
            title: r.seriesTitle,
            summary: r.seriesSummary,
          },
          parts: [],
          firstDate: dateIso,
          lastDate: dateIso,
        };
        seriesIndex.set(r.seriesSlug, entry);
        items.push(entry);
      }
      entry.parts.push({
        slug: post.slug ?? "",
        title: post.title ?? "",
        date_created: dateIso,
        thumbnail: post.thumbnail ?? null,
        description: post.description ?? null,
      });
      if (dateIso < entry.firstDate) entry.firstDate = dateIso;
      if (dateIso > entry.lastDate) entry.lastDate = dateIso;
    } else {
      items.push({ kind: "post", post });
    }
  }

  // Sort items by their most recent activity date (series uses last part).
  items.sort((a, b) => {
    const aDate = a.kind === "series" ? a.lastDate : a.post.date_created || "";
    const bDate = b.kind === "series" ? b.lastDate : b.post.date_created || "";
    return bDate.localeCompare(aDate);
  });

  // Sort each series's parts ASC (oldest first) so part 01 = the first
  // entry in the series and part N = the latest. The query above is DESC
  // for items-list ordering, but parts themselves should read in series
  // order regardless of how recently each was published.
  for (const item of items) {
    if (item.kind === "series") {
      item.parts.sort((a, b) => a.date_created.localeCompare(b.date_created));
    }
  }

  return options?.limit ? items.slice(0, options.limit) : items;
}

// If this post belongs to a series with 2+ posts, return the post's
// position plus prev/next within the series (oldest first). Returns null
// if the post isn't part of a multi-post series.
export async function getSeriesContext(
  postSlug: string,
): Promise<SeriesContext | null> {
  try {
    const seriesRow = await db
      .select({ slug: series.slug, title: series.title })
      .from(seriesPosts)
      .innerJoin(series, eq(seriesPosts.seriesSlug, series.slug))
      .where(eq(seriesPosts.postSlug, postSlug))
      .limit(1);

    if (!seriesRow.length) return null;
    const seriesEntry = seriesRow[0];

    const allParts = await db
      .select({ slug: posts.slug, title: posts.title })
      .from(seriesPosts)
      .innerJoin(posts, eq(seriesPosts.postSlug, posts.slug))
      .where(
        and(
          eq(seriesPosts.seriesSlug, seriesEntry.slug),
          eq(posts.status, "published"),
        ),
      )
      .orderBy(asc(posts.dateCreated));

    if (allParts.length < 2) return null;

    const idx = allParts.findIndex((p) => p.slug === postSlug);
    if (idx === -1) return null;

    return {
      series: seriesEntry,
      total: allParts.length,
      partNumber: idx + 1,
      parts: allParts,
      previous: idx > 0 ? allParts[idx - 1] : null,
      next: idx < allParts.length - 1 ? allParts[idx + 1] : null,
    };
  } catch {
    return null;
  }
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
    date_updated: row.dateUpdated?.toISOString(),
  };
}
