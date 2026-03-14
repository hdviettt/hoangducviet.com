CREATE TABLE "admin_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text DEFAULT 'admin' NOT NULL,
	"password_hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "global" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"tagline" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text,
	"size" integer,
	"width" integer,
	"height" integer,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"slug" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" jsonb,
	"navigation" text DEFAULT 'no',
	"date_created" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_categories" (
	"slug" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" text,
	"thumbnail" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"date_created" timestamp with time zone DEFAULT now() NOT NULL,
	"date_updated" timestamp with time zone,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "posts_categories" (
	"post_id" integer NOT NULL,
	"category_slug" text NOT NULL,
	CONSTRAINT "posts_categories_post_id_category_slug_pk" PRIMARY KEY("post_id","category_slug")
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"name" text,
	"description" text,
	"image" text
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"slug" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"thumbnail" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"date_created" timestamp with time zone DEFAULT now() NOT NULL,
	"date_updated" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "projects_posts" (
	"project_slug" text NOT NULL,
	"post_slug" text NOT NULL,
	CONSTRAINT "projects_posts_project_slug_post_slug_pk" PRIMARY KEY("project_slug","post_slug")
);
--> statement-breakpoint
ALTER TABLE "posts_categories" ADD CONSTRAINT "posts_categories_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts_categories" ADD CONSTRAINT "posts_categories_category_slug_post_categories_slug_fk" FOREIGN KEY ("category_slug") REFERENCES "public"."post_categories"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects_posts" ADD CONSTRAINT "projects_posts_project_slug_projects_slug_fk" FOREIGN KEY ("project_slug") REFERENCES "public"."projects"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects_posts" ADD CONSTRAINT "projects_posts_post_slug_posts_slug_fk" FOREIGN KEY ("post_slug") REFERENCES "public"."posts"("slug") ON DELETE cascade ON UPDATE no action;