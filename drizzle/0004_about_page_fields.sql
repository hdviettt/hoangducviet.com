ALTER TABLE "profile" ADD COLUMN IF NOT EXISTS "headline" text;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN IF NOT EXISTS "about_html" text;
