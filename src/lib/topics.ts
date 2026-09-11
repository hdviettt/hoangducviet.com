import { db } from "@/db";
import {
  postCategories,
  posts,
  postsCategories,
  projects,
  projectsCategories,
} from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";

// A topic is the one view this site could not give.
//
// The same three categories already tag both the writing and the work, but
// nothing joined them: a project sat on /work and the posts explaining it sat
// in a date-sorted feed, and the only thing connecting them was a reader
// noticing. This joins them, which also turns the chips on a project from
// labels that look like buttons into links that are.

export interface Topic {
  slug: string;
  title: string;
}

export interface TopicProject {
  slug: string;
  title: string;
  description: string | null;
}

export interface TopicPost {
  slug: string;
  title: string;
  description: string | null;
  date: string | null;
}

export async function getTopics(): Promise<Topic[]> {
  try {
    return await db
      .select({ slug: postCategories.slug, title: postCategories.title })
      .from(postCategories)
      .orderBy(asc(postCategories.title));
  } catch (error) {
    console.error("getTopics failed:", error);
    return [];
  }
}

export async function getTopic(slug: string): Promise<Topic | null> {
  if (!slug) return null;
  try {
    const rows = await db
      .select({ slug: postCategories.slug, title: postCategories.title })
      .from(postCategories)
      .where(eq(postCategories.slug, slug))
      .limit(1);
    return rows[0] ?? null;
  } catch (error) {
    console.error("getTopic failed:", error);
    return null;
  }
}

// Work first, then writing. Both published only: a topic page is a reader's
// view, and a draft is not part of it.
export async function getTopicContents(slug: string): Promise<{
  projects: TopicProject[];
  posts: TopicPost[];
}> {
  try {
    const [projectRows, postRows] = await Promise.all([
      db
        .select({
          slug: projects.slug,
          title: projects.title,
          description: projects.description,
        })
        .from(projectsCategories)
        .innerJoin(projects, eq(projects.slug, projectsCategories.projectSlug))
        .where(
          and(
            eq(projectsCategories.categorySlug, slug),
            eq(projects.status, "published"),
          ),
        )
        .orderBy(asc(projects.sortOrder)),
      db
        .select({
          slug: posts.slug,
          title: posts.title,
          description: posts.description,
          dateCreated: posts.dateCreated,
        })
        .from(postsCategories)
        .innerJoin(posts, eq(posts.id, postsCategories.postId))
        .where(
          and(
            eq(postsCategories.categorySlug, slug),
            eq(posts.status, "published"),
          ),
        )
        .orderBy(desc(posts.dateCreated)),
    ]);

    return {
      projects: projectRows.map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description ?? null,
      })),
      posts: postRows.map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description ?? null,
        date: p.dateCreated ? p.dateCreated.toISOString() : null,
      })),
    };
  } catch (error) {
    console.error("getTopicContents failed:", error);
    return { projects: [], posts: [] };
  }
}
