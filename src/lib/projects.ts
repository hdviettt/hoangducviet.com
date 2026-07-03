import { db } from "@/db";
import { posts, projectPosts, projects } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";

export interface Project {
  slug: string;
  title: string;
  tagline: string | null;
  content: string | null;
  thumbnail: string | null;
  repoUrl: string | null;
  liveUrl: string | null;
  techTags: string[] | null;
  status: string;
  buildStatus: string; // live | wip | archived
  featured: boolean;
  sortOrder: number;
  dateCreated?: string;
  dateUpdated?: string | null;
  posts?: Array<{
    slug: string;
    title: string;
    description: string | null;
    date_created: string | null;
  }>;
}

function mapRow(r: typeof projects.$inferSelect): Project {
  return {
    slug: r.slug,
    title: r.title,
    tagline: r.tagline,
    content: r.content,
    thumbnail: r.thumbnail,
    repoUrl: r.repoUrl,
    liveUrl: r.liveUrl,
    techTags: r.techTags ?? null,
    status: r.status,
    buildStatus: r.buildStatus,
    featured: r.featured,
    sortOrder: r.sortOrder,
    dateCreated: r.dateCreated?.toISOString(),
    dateUpdated: r.dateUpdated?.toISOString() ?? null,
  };
}

// Featured first, then manual sortOrder, then newest. Pass onlyPublished for
// public surfaces.
export async function getProjects(opts?: {
  onlyPublished?: boolean;
}): Promise<Project[]> {
  try {
    const rows = await db
      .select()
      .from(projects)
      .orderBy(
        desc(projects.featured),
        asc(projects.sortOrder),
        desc(projects.dateCreated),
      );
    const list = opts?.onlyPublished
      ? rows.filter((r) => r.status === "published")
      : rows;
    return list.map(mapRow);
  } catch {
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);
    if (!rows.length) return null;

    const related = await db
      .select({
        slug: posts.slug,
        title: posts.title,
        description: posts.description,
        dateCreated: posts.dateCreated,
      })
      .from(projectPosts)
      .innerJoin(posts, eq(projectPosts.postSlug, posts.slug))
      .where(eq(projectPosts.projectSlug, slug))
      .orderBy(asc(posts.dateCreated));

    return {
      ...mapRow(rows[0]),
      posts: related.map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description ?? null,
        date_created: p.dateCreated?.toISOString() ?? null,
      })),
    };
  } catch {
    return null;
  }
}
