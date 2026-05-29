import { db } from "@/db";
import { posts, series, seriesGroups, seriesPosts } from "@/db/schema";
import { and, asc, desc, eq, notInArray, sql } from "drizzle-orm";

export interface Series {
  slug: string;
  title?: string;
  url?: string | null;
  summary?: string | null;
  description?: string;
  thumbnail?: string | null;
  status?: string;
  group_slug?: string | null;
  group_title?: string | null;
  date_created?: string;
  date_updated?: string;
  posts?: Array<{
    slug: string;
    title: string;
    description: string | null;
    date_created: string | null;
    thumbnail: string | null;
  }>;
}

export async function getSeriesList(options?: {
  /**
   * When true, exclude series that are also a writing series (have 2+
   * published posts). Useful for surfaces that want to show only "things
   * built without writing series" — currently unused after the public
   * /projects route was removed.
   */
  excludeWritingSeries?: boolean;
}): Promise<Array<Series>> {
  let writingSeriesSlugs: string[] = [];
  if (options?.excludeWritingSeries) {
    const seriesRows = await db
      .select({
        seriesSlug: seriesPosts.seriesSlug,
        postCount: sql<number>`count(*)::int`,
      })
      .from(seriesPosts)
      .innerJoin(posts, eq(seriesPosts.postSlug, posts.slug))
      .where(eq(posts.status, "published"))
      .groupBy(seriesPosts.seriesSlug);
    writingSeriesSlugs = seriesRows
      .filter((r) => Number(r.postCount) >= 2)
      .map((r) => r.seriesSlug);
  }

  const baseWhere = eq(series.status, "published");
  const whereClause =
    writingSeriesSlugs.length > 0
      ? and(baseWhere, notInArray(series.slug, writingSeriesSlugs))
      : baseWhere;

  const result = await db
    .select({
      slug: series.slug,
      title: series.title,
      url: series.url,
      summary: series.summary,
      description: series.description,
      thumbnail: series.thumbnail,
      status: series.status,
      groupSlug: series.groupSlug,
      groupTitle: seriesGroups.title,
      dateCreated: series.dateCreated,
      dateUpdated: series.dateUpdated,
    })
    .from(series)
    .leftJoin(seriesGroups, eq(series.groupSlug, seriesGroups.slug))
    .where(whereClause)
    .orderBy(asc(seriesGroups.sortOrder), desc(series.dateCreated));

  return result.map((row) => ({
    slug: row.slug,
    title: row.title,
    url: row.url,
    summary: row.summary,
    description: row.description ?? undefined,
    thumbnail: row.thumbnail,
    status: row.status,
    group_slug: row.groupSlug,
    group_title: row.groupTitle,
    date_created: row.dateCreated?.toISOString(),
    date_updated: row.dateUpdated?.toISOString(),
  }));
}

export async function getSeriesBySlug(slug: string): Promise<Series> {
  if (!slug) throw new Error("Invalid slug");

  const result = await db
    .select({
      slug: series.slug,
      title: series.title,
      url: series.url,
      summary: series.summary,
      description: series.description,
      thumbnail: series.thumbnail,
      status: series.status,
      groupSlug: series.groupSlug,
      groupTitle: seriesGroups.title,
      dateCreated: series.dateCreated,
      dateUpdated: series.dateUpdated,
    })
    .from(series)
    .leftJoin(seriesGroups, eq(series.groupSlug, seriesGroups.slug))
    .where(eq(series.slug, slug))
    .limit(1);

  if (!result || result.length === 0) {
    throw new Error(`Series with slug "${slug}" not found`);
  }

  // Fetch related posts in series order (oldest first — Part 1 → Part N)
  const relatedPosts = await db
    .select({
      slug: posts.slug,
      title: posts.title,
      description: posts.description,
      dateCreated: posts.dateCreated,
      thumbnail: posts.thumbnail,
    })
    .from(seriesPosts)
    .innerJoin(posts, eq(seriesPosts.postSlug, posts.slug))
    .where(eq(seriesPosts.seriesSlug, slug))
    .orderBy(asc(posts.dateCreated));

  const row = result[0];
  return {
    slug: row.slug,
    title: row.title,
    url: row.url,
    summary: row.summary,
    description: row.description ?? undefined,
    thumbnail: row.thumbnail,
    status: row.status,
    group_slug: row.groupSlug,
    group_title: row.groupTitle,
    date_created: row.dateCreated?.toISOString(),
    date_updated: row.dateUpdated?.toISOString(),
    posts: relatedPosts.map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description ?? null,
      date_created: p.dateCreated?.toISOString() ?? null,
      thumbnail: p.thumbnail ?? null,
    })),
  };
}
