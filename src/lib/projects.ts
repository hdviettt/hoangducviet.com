import { db } from "@/db";
import {
  type ProjectFeature,
  type ProjectLogo,
  type ProjectMedia,
  type ProjectMetric,
  type ProjectStackGroup,
  posts,
  projectPosts,
  projects,
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

export interface ProjectChild {
  slug: string;
  title: string;
  description: string | null;
  buildStatus: string;
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
  date_created?: string;
  date_updated?: string;
  posts?: ProjectPostRef[];
  children?: ProjectChild[];
  parent?: { slug: string; title: string } | null;
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
    date_created: row.dateCreated?.toISOString(),
    date_updated: row.dateUpdated?.toISOString() ?? undefined,
    ...(related ? { posts: related } : {}),
  };
}

// Gan danh sach con vao tung du an cha. Dung chung cho ca /work lan trang chu:
// khoi featured lay so con lam eyebrow ("Platform . 4 agents inside"), nen chi
// mot trong hai ben nap children thi cung mot du an hien hai kieu o hai trang.
async function attachChildren(list: Project[]): Promise<Project[]> {
  const parentSlugs = list.map((p) => p.slug);
  if (parentSlugs.length === 0) return list;
  const childRows = await db
    .select({
      slug: projects.slug,
      title: projects.title,
      description: projects.description,
      buildStatus: projects.buildStatus,
      parentSlug: projects.parentSlug,
    })
    .from(projects)
    .where(
      and(
        eq(projects.status, "published"),
        inArray(projects.parentSlug, parentSlugs),
      ),
    )
    .orderBy(asc(projects.sortOrder));
  for (const p of list) {
    p.children = childRows
      .filter((c) => c.parentSlug === p.slug)
      .map((c) => ({
        slug: c.slug,
        title: c.title,
        description: c.description ?? null,
        buildStatus: c.buildStatus,
      }));
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
    return await attachChildren(rows.map((r) => mapProject(r)));
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
    return await attachChildren(rows.map((r) => mapProject(r)));
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

    // Child pieces (for a parent like the platform).
    const childRows = await db
      .select({
        slug: projects.slug,
        title: projects.title,
        description: projects.description,
        buildStatus: projects.buildStatus,
      })
      .from(projects)
      .where(
        and(eq(projects.parentSlug, slug), eq(projects.status, "published")),
      )
      .orderBy(asc(projects.sortOrder));
    project.children = childRows.map((c) => ({
      ...c,
      description: c.description ?? null,
    }));

    // Parent (for a child), so the deep-dive can link up.
    if (project.parentSlug) {
      const pr = await db
        .select({ slug: projects.slug, title: projects.title })
        .from(projects)
        .where(eq(projects.slug, project.parentSlug))
        .limit(1);
      project.parent = pr[0] ?? null;
    }

    return project;
  } catch (error) {
    console.error("getProjectBySlug failed:", error);
    return null;
  }
}
