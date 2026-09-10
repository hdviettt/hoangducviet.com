-- CMS-only folders for the admin navigation panel.
--
-- These organise the author's own view of the library and are never read by
-- the public site: no route, feed, sitemap or JSON-LD touches them. Nothing
-- here changes what a reader sees.
--
-- Two tables rather than one tree table holding both folders and items.
-- A row per item would have to be created whenever a post is created and
-- deleted whenever one is removed, and would drift the first time either
-- happened outside the admin. Instead an item with no placement row is simply
-- unfiled and shows at the root, so a new post appears without anything having
-- to remember to file it.
--
-- Prod: railway run --service database psql < drizzle/0010_cms_folders.sql

CREATE TABLE IF NOT EXISTS "cms_folders" (
  "id" serial PRIMARY KEY,
  -- Which panel the folder belongs to: posts, work or series. A folder never
  -- spans two panels, so the scope is part of its identity.
  "scope" text NOT NULL,
  "name" text NOT NULL,
  -- Self-reference for nesting. Deleting a parent deletes its subtree; the
  -- items inside are only unfiled, never removed, because their placement
  -- rows cascade separately.
  "parent_id" integer REFERENCES "cms_folders"("id") ON DELETE CASCADE,
  "sort_order" integer NOT NULL DEFAULT 0,
  "date_created" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "cms_folders_scope_parent_idx"
  ON "cms_folders" ("scope", "parent_id", "sort_order");

CREATE TABLE IF NOT EXISTS "cms_item_placement" (
  "scope" text NOT NULL,
  "item_slug" text NOT NULL,
  -- NULL means filed at the root of its scope with an explicit order, which is
  -- different from having no row at all (unfiled, default order).
  "folder_id" integer REFERENCES "cms_folders"("id") ON DELETE SET NULL,
  "sort_order" integer NOT NULL DEFAULT 0,
  PRIMARY KEY ("scope", "item_slug")
);

CREATE INDEX IF NOT EXISTS "cms_item_placement_folder_idx"
  ON "cms_item_placement" ("scope", "folder_id", "sort_order");
