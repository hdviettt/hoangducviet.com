import { db } from "@/db";
import { posts, series } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";

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

    // Every post canonicalizes at /posts/[slug] (series membership no longer
    // creates a nested URL).
    const postEntries = allPosts.map((post) => ({
      url: `${BASE_URL}/posts/${post.slug}`,
      lastModified: post.dateUpdated ?? post.dateCreated ?? new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    const seriesEntries = allSeries.map((s) => ({
      url: `${BASE_URL}/collection/${s.slug}`,
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
      {
        url: `${BASE_URL}/posts`,
        lastModified:
          allPosts[0]?.dateUpdated ?? allPosts[0]?.dateCreated ?? new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/about`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.8,
      },
      ...postEntries,
      ...seriesEntries,
    ];
  } catch {
    return [{ url: BASE_URL, lastModified: new Date(), priority: 1 }];
  }
}
