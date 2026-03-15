CREATE TABLE "project_groups" (
	"slug" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "group_slug" text;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_group_slug_project_groups_slug_fk" FOREIGN KEY ("group_slug") REFERENCES "public"."project_groups"("slug") ON DELETE set null ON UPDATE no action;
