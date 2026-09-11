import { db } from "@/db";
import {
  type ProjectFeature,
  type ProjectLogo,
  type ProjectMedia,
  type ProjectMetric,
  type ProjectStackGroup,
  postCategories,
  posts,
  projectPosts,
  projects,
  projectsCategories,
} from "@/db/schema";
import { and, asc, desc, eq, inArray } from "drizzle-orm";

export type {
  ProjectFeature,
  ProjectLogo,
  ProjectStackGroup,
  ProjectMedia,
  ProjectMetric,
} from "@/db/schema";

export interface ProjectPostRef {
  slug: string;
  title: string;
  description: string | null;
  date_created: string | null;
}

export interface ProjectCategory {
  slug: string;
  title: string;
}

export interface Project {
  slug: string;
  title: string;
  // `tagline` van con la mot cot trong DB nhung khong con duoc doc o dau:
  // the ngoai va trang trong deu dung `description`. Hai truong cho cung mot
  // cau, mot cai co gioi han do dai va mot cai khong, la hai quy uoc cho mot
  // viec — va no dan den the /work noi mot dang con trang du an noi mot dang.
  description: string | null;
  content: string | null;
  thumbnail: string | null;
  repoUrl: string | null;
  liveUrl: string | null;
  techTags: string[] | null; // legacy; stack is the source
  // Still on the row, and deliberately not read anywhere. Work is flat: which
  // project contains which is something the description says in prose, not
  // something the layout derives. The column keeps what it already holds
  // because nothing writes it either — see the work API, which stopped
  // setting it so a save cannot quietly clear history.
  parentSlug: string | null;
  features: ProjectFeature[];
  stack: ProjectStackGroup[];
  models: ProjectLogo[];
  media: ProjectMedia[];
  metrics: ProjectMetric[];
  status: string;
  buildStatus: string;
  featured: boolean;
  sortOrder: number;
  categories: ProjectCategory[];
  date_created?: string;
  date_updated?: string;
  posts?: ProjectPostRef[];
}

type ProjectRow = typeof projects.$inferSelect;

// jsonb columns come back already parsed (pg + Drizzle .$type), so this is a
// straight pass-through with the NOT NULL '[]' defaults guaranteeing arrays.
function mapProject(row: ProjectRow, related?: ProjectPostRef[]): Project {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    content: row.content,
    thumbnail: row.thumbnail,
    repoUrl: row.repoUrl,
    liveUrl: row.liveUrl,
    techTags: row.techTags ?? null,
    parentSlug: row.parentSlug ?? null,
    features: row.features ?? [],
    stack: row.stack ?? [],
    models: row.models ?? [],
    media: row.media ?? [],
    metrics: row.metrics ?? [],
    status: row.status,
    buildStatus: row.buildStatus,
    featured: row.featured,
    sortOrder: row.sortOrder,
    categories: [],
    date_created: row.dateCreated?.toISOString(),
    date_updated: row.dateUpdated?.toISOString() ?? undefined,
    ...(related ? { posts: related } : {}),
  };
}

// One query for the whole page rather than one per project. Three featured
// projects is three round trips the naive way, and the homepage already pays
// for a feed and a profile before it gets here.
//
// Ordered by title so a project's tags read the same on every surface: without
// it Postgres is free to hand back "SEO · AI" on the homepage and "AI · SEO"
// on /work, and a reader who notices reads it as two different labels.
async function attachCategories(list: Project[]): Promise<Project[]> {
  const slugs = list.map((p) => p.slug);
  if (slugs.length === 0) return list;
  const rows = await db
    .select({
      projectSlug: projectsCategories.projectSlug,
      slug: postCategories.slug,
      title: postCategories.title,
    })
    .from(projectsCategories)
    .innerJoin(
      postCategories,
      eq(postCategories.slug, projectsCategories.categorySlug),
    )
    .where(inArray(projectsCategories.projectSlug, slugs))
    .orderBy(asc(postCategories.title));
  for (const p of list) {
    p.categories = rows
      .filter((r) => r.projectSlug === p.slug)
      .map((r) => ({ slug: r.slug, title: r.title }));
  }
  return list;
}

export async function getProjects(): Promise<Project[]> {
  try {
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.status, "published"))
      .orderBy(asc(projects.sortOrder), desc(projects.dateCreated));
    return await attachCategories(rows.map((r) => mapProject(r)));
  } catch (error) {
    console.error("getProjects failed:", error);
    return [];
  }
}

export async function getFeaturedProjects(): Promise<Project[]> {
  try {
    const rows = await db
      .select()
      .from(projects)
      .where(and(eq(projects.status, "published"), eq(projects.featured, true)))
      .orderBy(asc(projects.sortOrder));
    return await attachCategories(rows.map((r) => mapProject(r)));
  } catch (error) {
    console.error("getFeaturedProjects failed:", error);
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!slug) return null;
  try {
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);
    if (!rows.length || rows[0].status !== "published") return null;

    // Backing writing, published only, oldest first (Part 1 to Part N).
    const related = await db
      .select({
        slug: posts.slug,
        title: posts.title,
        description: posts.description,
        dateCreated: posts.dateCreated,
      })
      .from(projectPosts)
      .innerJoin(posts, eq(projectPosts.postSlug, posts.slug))
      .where(
        and(eq(projectPosts.projectSlug, slug), eq(posts.status, "published")),
      )
      .orderBy(asc(posts.dateCreated));

    const project = mapProject(
      rows[0],
      related.map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description ?? null,
        date_created: p.dateCreated?.toISOString() ?? null,
      })),
    );

    await attachCategories([project]);

    return project;
  } catch (error) {
    console.error("getProjectBySlug failed:", error);
    return null;
  }
}
