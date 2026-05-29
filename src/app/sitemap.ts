import type { MetadataRoute } from "next";
import { db } from "@/db";
import { posts, series, seriesPosts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const allPosts = await db
      .select({
        slug: posts.slug,
        dateUpdated: posts.dateUpdated,
        dateCreated: posts.dateCreated,
      })
      .from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.dateCreated));

    const allSeries = await db
      .select({
        slug: series.slug,
        dateUpdated: series.dateUpdated,
        dateCreated: series.dateCreated,
      })
      .from(series)
      .where(eq(series.status, "published"))
      .orderBy(desc(series.dateCreated));

    // Map each post slug to its series slug (if any). Series posts canonicalize
    // at /series/[seriesSlug]/[postSlug]; standalone posts at /posts/[slug].
    const postSeriesRows = await db
      .select({
        postSlug: seriesPosts.postSlug,
        seriesSlug: seriesPosts.seriesSlug,
      })
      .from(seriesPosts);
    const postToSeries = new Map(
      postSeriesRows.map((r) => [r.postSlug, r.seriesSlug]),
    );

    const postEntries = allPosts.map((post) => {
      const seriesSlug = postToSeries.get(post.slug);
      const url = seriesSlug
        ? `${BASE_URL}/series/${seriesSlug}/${post.slug}`
        : `${BASE_URL}/posts/${post.slug}`;
      return {
        url,
        lastModified: post.dateUpdated ?? post.dateCreated ?? new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      };
    });

    const seriesEntries = allSeries.map((s) => ({
      url: `${BASE_URL}/series/${s.slug}`,
      lastModified: s.dateUpdated ?? s.dateCreated ?? new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
      ...postEntries,
      ...seriesEntries,
    ];
  } catch {
    return [{ url: BASE_URL, lastModified: new Date(), priority: 1 }];
  }
}
