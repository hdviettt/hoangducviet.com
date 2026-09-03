-- Add a "by the numbers" stat band to projects: an array of {value, label}.
-- Local: applied to the Docker DB and baked into docker/initdb/01-schema.sql.
-- Prod: apply with `railway run --service database psql < drizzle/0009_project_metrics.sql`.
ALTER TABLE "projects"
  ADD COLUMN IF NOT EXISTS "metrics" jsonb NOT NULL DEFAULT '[]'::jsonb;
