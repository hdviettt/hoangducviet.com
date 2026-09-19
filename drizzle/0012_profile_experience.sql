-- The career timeline moves out of src/lib/resume.ts and into the CMS.
--
-- It was a hand-typed constant, so only a deploy could change it, and it rotted
-- without anyone noticing: checked against the real LinkedIn profile in Sep
-- 2026, four of its five roles were wrong -- a title, a start month, two roles
-- that did not exist, and an intern role three months short. Data that only one
-- person can edit is data nobody edits.
--
-- jsonb rather than three tables: the shape is a single nested document read in
-- one piece and written in one piece, never queried across. `profile` already
-- holds the rest of the About page and is a singleton row.
ALTER TABLE profile
  ADD COLUMN IF NOT EXISTS experience jsonb NOT NULL DEFAULT '[]'::jsonb;
