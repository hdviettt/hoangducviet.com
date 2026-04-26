import type { MetadataRoute } from "next";
import { db } from "@/db";
import { posts, projects } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";

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

    const allProjects = await db
      .select({
        slug: projects.slug,
        dateUpdated: projects.dateUpdated,
        dateCreated: projects.dateCreated,
      })
      .from(projects)
      .where(eq(projects.status, "published"))
      .orderBy(desc(projects.dateCreated));

    const postEntries = allPosts.map((post) => ({
      url: `${BASE_URL}/posts/${post.slug}`,
      lastModified: post.dateUpdated ?? post.dateCreated ?? new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    const projectEntries = allProjects.map((project) => ({
      url: `${BASE_URL}/projects/${project.slug}`,
      lastModified:
        project.dateUpdated ?? project.dateCreated ?? new Date(),
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
      ...projectEntries,
    ];
  } catch {
    // Return static pages if DB is unavailable (e.g. build-time prerendering)
    return [{ url: BASE_URL, lastModified: new Date(), priority: 1 }];
  }
}
