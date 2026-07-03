CREATE TABLE IF NOT EXISTS "projects" (
	"slug" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"tagline" text,
	"content" text,
	"thumbnail" text,
	"repo_url" text,
	"live_url" text,
	"tech_tags" text[],
	"status" text DEFAULT 'draft' NOT NULL,
	"build_status" text DEFAULT 'live' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"date_created" timestamp with time zone DEFAULT now() NOT NULL,
	"date_updated" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_posts" (
	"project_slug" text NOT NULL REFERENCES "projects"("slug") ON DELETE CASCADE,
	"post_slug" text NOT NULL REFERENCES "posts"("slug") ON DELETE CASCADE,
	CONSTRAINT "project_posts_project_slug_post_slug_pk" PRIMARY KEY("project_slug","post_slug")
);
