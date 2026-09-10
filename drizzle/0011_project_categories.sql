-- Projects get the same topic vocabulary the posts already use.
--
-- A separate join table rather than a column on `projects`: the vocabulary
-- lives in `post_categories` and is edited in one place, and a project can
-- carry more than one topic. Reusing that table rather than starting a second
-- one is the point — two tag lists for one site is how "AI" and "ai " end up
-- being different things.
--
-- Keyed on the slug, not an id, because `projects` is keyed on its slug. Both
-- sides cascade: deleting a project takes its tags with it, and retiring a
-- category takes it off every project rather than leaving a dangling row.
CREATE TABLE IF NOT EXISTS "projects_categories" (
  "project_slug" text NOT NULL REFERENCES "projects"("slug") ON DELETE CASCADE,
  "category_slug" text NOT NULL REFERENCES "post_categories"("slug") ON DELETE CASCADE,
  CONSTRAINT "projects_categories_pk" PRIMARY KEY ("project_slug", "category_slug")
);
