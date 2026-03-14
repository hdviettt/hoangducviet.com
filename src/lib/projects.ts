import { db } from "@/db";
import { posts, projects, projectsPosts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { desc } from "drizzle-orm";

export interface Project {
  slug: string;
  title?: string;
  description?: string;
  thumbnail?: string | null;
  status?: string;
  date_created?: string;
  date_updated?: string;
  posts?: Array<{
    slug: string;
    title: string;
    date_created: string | null;
  }>;
}

export async function getProjects(): Promise<Array<Project>> {
  const result = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.dateCreated));

  return result.map(mapProject);
}

export async function getProjectBySlug(slug: string): Promise<Project> {
  if (!slug) throw new Error("Invalid slug");

  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);

  if (!result || result.length === 0) {
    throw new Error(`Project with slug "${slug}" not found`);
  }

  // Fetch related posts
  const relatedPosts = await db
    .select({
      slug: posts.slug,
      title: posts.title,
      dateCreated: posts.dateCreated,
    })
    .from(projectsPosts)
    .innerJoin(posts, eq(projectsPosts.postSlug, posts.slug))
    .where(eq(projectsPosts.projectSlug, slug));

  return {
    ...mapProject(result[0]),
    posts: relatedPosts.map((p) => ({
      slug: p.slug,
      title: p.title,
      date_created: p.dateCreated?.toISOString() ?? null,
    })),
  };
}

function mapProject(row: typeof projects.$inferSelect): Project {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description ?? undefined,
    thumbnail: row.thumbnail,
    status: row.status,
    date_created: row.dateCreated?.toISOString(),
    date_updated: row.dateUpdated?.toISOString(),
  };
}
