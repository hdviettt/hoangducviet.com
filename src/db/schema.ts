import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Shapes of the rich showcase JSON stored on a project. Kept here so both the
// schema ($type) and src/lib/projects.ts share one source of truth.
export type ProjectFeature = { name: string; desc: string };
export type ProjectLogo = { name: string; mark?: string; letter?: string };
export type ProjectStackGroup = { group: string; items: ProjectLogo[] };
export type ProjectMedia = {
  type: "image" | "video";
  src: string;
  caption?: string;
  /**
   * First-frame still for a video, shown before playback starts.
   *
   * Without it the largest element on the page is the video itself, and LCP
   * cannot finish until enough of the file has arrived to paint a frame:
   * measured 3.8s on desktop and 7.5s on a slow connection. A ~70 KB still
   * paints immediately and the clip fades in behind it.
   */
  poster?: string;
};
// A single "by the numbers" stat: a hard figure and what it measures.
export type ProjectMetric = { value: string; label: string };

// Site-wide settings (single row)
export const global = pgTable("global", {
  id: integer("id").primaryKey().default(1),
  title: text("title").notNull().default(""),
  tagline: text("tagline").notNull().default(""),
  // Slug of the flagship series surfaced as "Start here" on the homepage.
  featuredSeriesSlug: text("featured_series_slug"),
});

// Profile / author data (single row, replaces Directus "hdviet" collection)
/** One line of a role's results. `proof` turns the claim into a link. */
export interface ExperienceHighlight {
  text: string;
  // Optional link to the project page that demonstrates the claim. A line
  // saying the platform runs twenty solutions is an assertion; the same line
  // pointing at the platform is evidence.
  proof?: { label: string; slug: string };
}

export interface ExperienceRole {
  title: string;
  // Optional: LinkedIn does not always carry one, and filling it in to satisfy
  // a type would be inventing a fact.
  type?: string; // Full-time / Internship / Apprenticeship
  start: string; // "YYYY-MM"
  end?: string; // "YYYY-MM"; omit for a role still running
  note?: string;
  highlights?: ExperienceHighlight[];
}

export interface ExperienceCompany {
  company: string;
  /**
   * Which track this belongs to on the About chart: work on the left,
   * education on the right. Absent means work, so every row written before
   * this existed keeps its meaning.
   *
   * Education reuses the same shape rather than getting a column of its own.
   * A school is an organisation, a degree is a thing you held there for a
   * span of months, and the column is jsonb -- so this is a field, not a
   * migration.
   */
  kind?: "work" | "education";
  url?: string;
  logo?: string;
  location?: string;
  // Newest first, which is the order the timeline draws and the order the
  // company's own span is derived from.
  roles: ExperienceRole[];
}

export const profile = pgTable("profile", {
  id: integer("id").primaryKey().default(1),
  name: text("name"),
  description: text("description"), // HTML — homepage hero bio
  image: text("image"), // R2 URL or legacy /uploads/ path
  headline: text("headline"), // About page — short H1 line
  aboutHtml: text("about_html"), // About page — long-form bio (HTML)
  // The career timeline. It lived in src/lib/resume.ts as a hand-typed
  // constant, which meant only a deploy could change it -- and it silently
  // rotted: when it was checked against the real profile, four of its five
  // roles were wrong. Here it is editable in the CMS like everything else.
  experience: jsonb("experience")
    .$type<ExperienceCompany[]>()
    .notNull()
    .default([]),
});

// Post categories
export const postCategories = pgTable("post_categories", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
});

// Blog posts
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"), // markdown
  thumbnail: text("thumbnail"), // R2 URL or legacy /uploads/ path
  status: text("status").notNull().default("draft"),
  likeCount: integer("like_count").notNull().default(0),
  dateCreated: timestamp("date_created", { withTimezone: true })
    .notNull()
    .defaultNow(),
  dateUpdated: timestamp("date_updated", { withTimezone: true }),
});

// Anonymous post likes — one row per (post, anon cookie) pair.
// Source of truth for whether a given anon_id has liked a post.
// posts.like_count is a denormalized counter kept in sync transactionally.
export const postLikes = pgTable(
  "post_likes",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    anonId: text("anon_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.postId, table.anonId] })],
);

// Many-to-many: posts <-> categories
export const postsCategories = pgTable(
  "posts_categories",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    categorySlug: text("category_slug")
      .notNull()
      .references(() => postCategories.slug, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.postId, table.categorySlug] })],
);

// Many-to-many: projects <-> the same categories the posts use.
//
// Deliberately `post_categories` and not a second vocabulary. One list of
// topics for the site means "AI" is one thing whether it labels an essay or a
// project; two lists is how a taxonomy quietly forks.
export const projectsCategories = pgTable(
  "projects_categories",
  {
    projectSlug: text("project_slug")
      .notNull()
      .references(() => projects.slug, { onDelete: "cascade" }),
    categorySlug: text("category_slug")
      .notNull()
      .references(() => postCategories.slug, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.projectSlug, table.categorySlug] })],
);

// Series groups (e.g. "Personal", "AI", "Machine Learning")
export const seriesGroups = pgTable("series_groups", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// Series — topical containers for ongoing writing. A series with 2+ published
// posts surfaces on the homepage as a SeriesBlock; with 0–1 posts, it's an
// editorial placeholder.
export const series = pgTable("series", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  url: text("url"),
  summary: text("summary"),
  description: text("description"), // HTML — WYSIWYG content for detail page
  thumbnail: text("thumbnail"),
  status: text("status").notNull().default("draft"),
  groupSlug: text("group_slug").references(() => seriesGroups.slug, {
    onDelete: "set null",
  }),
  dateCreated: timestamp("date_created", { withTimezone: true })
    .notNull()
    .defaultNow(),
  dateUpdated: timestamp("date_updated", { withTimezone: true }),
});

// Many-to-many: series <-> posts
export const seriesPosts = pgTable(
  "series_posts",
  {
    seriesSlug: text("series_slug")
      .notNull()
      .references(() => series.slug, { onDelete: "cascade" }),
    postSlug: text("post_slug")
      .notNull()
      .references(() => posts.slug, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.seriesSlug, table.postSlug] })],
);

// Admin user (single user for personal blog)
export const adminUser = pgTable("admin_user", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().default("admin"),
  passwordHash: text("password_hash").notNull(),
});

// Projects — things I built (tools, apps, experiments). A first-class content
// type separate from writing series: carries repo/demo links, tech tags, and a
// build status the series model can't cleanly hold.
export const projects = pgTable("projects", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  tagline: text("tagline"), // one-liner for cards
  description: text("description"), // showcase paragraph under the title
  content: text("content"), // HTML long-form writeup on the detail page
  thumbnail: text("thumbnail"),
  repoUrl: text("repo_url"),
  liveUrl: text("live_url"),
  techTags: text("tech_tags").array(), // legacy flat tags; stack is the source now
  parentSlug: text("parent_slug"), // soft self-ref: a child piece of a parent project
  // Rich showcase content (see the Project* types above).
  features: jsonb("features").$type<ProjectFeature[]>().notNull().default([]),
  stack: jsonb("stack").$type<ProjectStackGroup[]>().notNull().default([]),
  models: jsonb("models").$type<ProjectLogo[]>().notNull().default([]),
  media: jsonb("media").$type<ProjectMedia[]>().notNull().default([]),
  metrics: jsonb("metrics").$type<ProjectMetric[]>().notNull().default([]),
  status: text("status").notNull().default("draft"), // draft | published
  buildStatus: text("build_status").notNull().default("live"), // live | wip | archived
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  dateCreated: timestamp("date_created", { withTimezone: true })
    .notNull()
    .defaultNow(),
  dateUpdated: timestamp("date_updated", { withTimezone: true }),
});

// Many-to-many: projects <-> posts (a project links to its explainer writing)
export const projectPosts = pgTable(
  "project_posts",
  {
    projectSlug: text("project_slug")
      .notNull()
      .references(() => projects.slug, { onDelete: "cascade" }),
    postSlug: text("post_slug")
      .notNull()
      .references(() => posts.slug, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.projectSlug, table.postSlug] })],
);

// Media uploads tracking
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type"),
  size: integer("size"),
  width: integer("width"),
  height: integer("height"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// CMS-only organisation.
//
// Folders and item placement exist to organise the admin navigation panel and
// are never read by the public site. Nothing in `src/app/(public routes)`,
// the feed, the sitemap or the JSON-LD builders touches these two tables.
// ---------------------------------------------------------------------------

export const cmsFolders = pgTable("cms_folders", {
  id: serial("id").primaryKey(),
  /** Which panel the folder belongs to: "posts" | "work" | "series". */
  scope: text("scope").notNull(),
  name: text("name").notNull(),
  parentId: integer("parent_id"),
  sortOrder: integer("sort_order").notNull().default(0),
  dateCreated: timestamp("date_created", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Where one item sits. An item with no row is unfiled and shows at the root,
 * so a newly created post needs nothing done to it to appear.
 */
export const cmsItemPlacement = pgTable(
  "cms_item_placement",
  {
    scope: text("scope").notNull(),
    itemSlug: text("item_slug").notNull(),
    folderId: integer("folder_id"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.scope, table.itemSlug] })],
);
