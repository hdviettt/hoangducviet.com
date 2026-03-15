import {
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Site-wide settings (single row)
export const global = pgTable("global", {
  id: integer("id").primaryKey().default(1),
  title: text("title").notNull().default(""),
  tagline: text("tagline").notNull().default(""),
});

// Profile / author data (single row, replaces Directus "hdviet" collection)
export const profile = pgTable("profile", {
  id: integer("id").primaryKey().default(1),
  name: text("name"),
  description: text("description"), // HTML
  image: text("image"), // relative path: /uploads/profile.jpg
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
  thumbnail: text("thumbnail"), // relative path: /uploads/posts/thumb.jpg
  status: text("status").notNull().default("draft"),
  dateCreated: timestamp("date_created", { withTimezone: true })
    .notNull()
    .defaultNow(),
  dateUpdated: timestamp("date_updated", { withTimezone: true }),
});

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

// Project groups (e.g. "Personal", "AI", "Machine Learning")
export const projectGroups = pgTable("project_groups", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// Projects
export const projects = pgTable("projects", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  description: text("description"), // HTML
  thumbnail: text("thumbnail"),
  status: text("status").notNull().default("draft"),
  groupSlug: text("group_slug").references(() => projectGroups.slug, {
    onDelete: "set null",
  }),
  dateCreated: timestamp("date_created", { withTimezone: true })
    .notNull()
    .defaultNow(),
  dateUpdated: timestamp("date_updated", { withTimezone: true }),
});

// Many-to-many: projects <-> posts
export const projectsPosts = pgTable(
  "projects_posts",
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

// Admin user (single user for personal blog)
export const adminUser = pgTable("admin_user", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().default("admin"),
  passwordHash: text("password_hash").notNull(),
});

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
