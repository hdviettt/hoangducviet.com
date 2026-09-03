-- Projects can nest one level: a parent project (e.g. the agentic platform)
-- with standalone child pieces. parent_slug is a soft self-reference.
ALTER TABLE "projects"
  ADD COLUMN IF NOT EXISTS "parent_slug" text;
