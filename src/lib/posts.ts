import { db } from "@/db";
import {
  postCategories,
  posts,
  postsCategories,
  projects,
  projectsPosts,
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

export async function getProjectForPost(
  postSlug: string,
): Promise<{ slug: string; title: string } | null> {
  try {
    const result = await db
      .select({
        slug: projects.slug,
        title: projects.title,
      })
      .from(projectsPosts)
      .innerJoin(projects, eq(projectsPosts.projectSlug, projects.slug))
      .where(eq(projectsPosts.postSlug, postSlug))
      .limit(1);

    return result.length ? result[0] : null;
  } catch {
    return null;
  }
}

export interface SeriesContext {
  project: { slug: string; title: string };
  total: number;
  partNumber: number;
  parts: Array<{ slug: string; title: string }>;
  previous: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

// Feed items collapse multi-post projects into a single series row so a
// chronological list isn't dominated by one project's parts. A standalone
// post (not in a project, or in a project with only 1 published post)
// renders as a `post` item; a project with 2+ published posts renders as
// a single `series` item with date range and part count. All dates are ISO
// strings so the type is safe to pass from server to client components.
export type FeedItem =
  | { kind: "post"; post: Post }
  | {
      kind: "series";
      project: {
        slug: string;
        title: string;
        summary: string | null;
      };
      parts: { slug: string; title: string; date_created: string }[];
      firstDate: string;
      lastDate: string;
    };

export async function getFeedItems(options?: {
  limit?: number;
}): Promise<FeedItem[]> {
  // Pull all published posts with their (optional) project association.
  const rows = await db
    .select({
      post: posts,
      projectSlug: projects.slug,
      projectTitle: projects.title,
      projectSummary: projects.summary,
    })
    .from(posts)
    .leftJoin(projectsPosts, eq(projectsPosts.postSlug, posts.slug))
    .leftJoin(projects, eq(projects.slug, projectsPosts.projectSlug))
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.dateCreated));

  // Count published posts per project so we know which projects qualify
  // as a series (2+ posts).
  const projectPostCount = new Map<string, number>();
  for (const r of rows) {
    if (r.projectSlug) {
      projectPostCount.set(
        r.projectSlug,
        (projectPostCount.get(r.projectSlug) || 0) + 1,
      );
    }
  }

  const items: FeedItem[] = [];
  const seriesIndex = new Map<string, FeedItem & { kind: "series" }>();

  for (const r of rows) {
    const post = mapPost(r.post);
    const dateIso = (r.post.dateCreated as Date).toISOString();
    const isSeriesMember =
      r.projectSlug != null &&
      r.projectTitle != null &&
      (projectPostCount.get(r.projectSlug) || 0) >= 2;

    if (isSeriesMember && r.projectSlug && r.projectTitle) {
      let series = seriesIndex.get(r.projectSlug);
      if (!series) {
        series = {
          kind: "series",
          project: {
            slug: r.projectSlug,
            title: r.projectTitle,
            summary: r.projectSummary,
          },
          parts: [],
          firstDate: dateIso,
          lastDate: dateIso,
        };
        seriesIndex.set(r.projectSlug, series);
        items.push(series);
      }
      series.parts.push({
        slug: post.slug ?? "",
        title: post.title ?? "",
        date_created: dateIso,
      });
      if (dateIso < series.firstDate) series.firstDate = dateIso;
      if (dateIso > series.lastDate) series.lastDate = dateIso;
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

  return options?.limit ? items.slice(0, options.limit) : items;
}

// If this post belongs to a project with 2+ posts, treat the project as a
// "series" and return the post's position plus prev/next within the series
// (oldest first). Returns null if the post isn't part of a series.
export async function getSeriesContext(
  postSlug: string,
): Promise<SeriesContext | null> {
  try {
    const projectRow = await db
      .select({ slug: projects.slug, title: projects.title })
      .from(projectsPosts)
      .innerJoin(projects, eq(projectsPosts.projectSlug, projects.slug))
      .where(eq(projectsPosts.postSlug, postSlug))
      .limit(1);

    if (!projectRow.length) return null;
    const project = projectRow[0];

    const allParts = await db
      .select({ slug: posts.slug, title: posts.title })
      .from(projectsPosts)
      .innerJoin(posts, eq(projectsPosts.postSlug, posts.slug))
      .where(
        and(
          eq(projectsPosts.projectSlug, project.slug),
          eq(posts.status, "published"),
        ),
      )
      .orderBy(asc(posts.dateCreated));

    if (allParts.length < 2) return null;

    const idx = allParts.findIndex((p) => p.slug === postSlug);
    if (idx === -1) return null;

    return {
      project,
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
