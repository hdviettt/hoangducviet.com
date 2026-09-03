-- Projects become a first-class showcase content type: the rich homepage
-- content (description, features, grouped stack, models, media) moves into the
-- projects table so Selected Work and /work render from data, not hardcode.
ALTER TABLE "projects"
  ADD COLUMN IF NOT EXISTS "description" text,
  ADD COLUMN IF NOT EXISTS "features" jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "stack"    jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "models"   jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "media"    jsonb NOT NULL DEFAULT '[]'::jsonb;
