import { db } from "@/db";
import { posts, projectGroups, projects, projectsPosts } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";

export interface Project {
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
  }>;
}

export interface ProjectGroup {
  slug: string;
  title: string;
  sortOrder: number;
}

export async function getProjects(): Promise<Array<Project>> {
  const result = await db
    .select({
      slug: projects.slug,
      title: projects.title,
      url: projects.url,
      summary: projects.summary,
      description: projects.description,
      thumbnail: projects.thumbnail,
      status: projects.status,
      groupSlug: projects.groupSlug,
      groupTitle: projectGroups.title,
      dateCreated: projects.dateCreated,
      dateUpdated: projects.dateUpdated,
    })
    .from(projects)
    .leftJoin(projectGroups, eq(projects.groupSlug, projectGroups.slug))
    .orderBy(asc(projectGroups.sortOrder), desc(projects.dateCreated));

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

export async function getProjectGroups(): Promise<Array<ProjectGroup>> {
  return db
    .select()
    .from(projectGroups)
    .orderBy(asc(projectGroups.sortOrder), asc(projectGroups.title));
}

export async function getProjectBySlug(slug: string): Promise<Project> {
  if (!slug) throw new Error("Invalid slug");

  const result = await db
    .select({
      slug: projects.slug,
      title: projects.title,
      url: projects.url,
      summary: projects.summary,
      description: projects.description,
      thumbnail: projects.thumbnail,
      status: projects.status,
      groupSlug: projects.groupSlug,
      groupTitle: projectGroups.title,
      dateCreated: projects.dateCreated,
      dateUpdated: projects.dateUpdated,
    })
    .from(projects)
    .leftJoin(projectGroups, eq(projects.groupSlug, projectGroups.slug))
    .where(eq(projects.slug, slug))
    .limit(1);

  if (!result || result.length === 0) {
    throw new Error(`Project with slug "${slug}" not found`);
  }

  // Fetch related posts sorted newest first
  const relatedPosts = await db
    .select({
      slug: posts.slug,
      title: posts.title,
      description: posts.description,
      dateCreated: posts.dateCreated,
    })
    .from(projectsPosts)
    .innerJoin(posts, eq(projectsPosts.postSlug, posts.slug))
    .where(eq(projectsPosts.projectSlug, slug))
    .orderBy(desc(posts.dateCreated));

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
    })),
  };
}
