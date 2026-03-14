import { db } from "@/db";
import { media, posts, projects } from "@/db/schema";
import { count, desc } from "drizzle-orm";
import Link from "next/link";
import StatusToggle from "@/components/admin/StatusToggle";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [postCount, projectCount, mediaCount, recentPosts] =
    await Promise.all([
      db.select({ value: count() }).from(posts),
      db.select({ value: count() }).from(projects),
      db.select({ value: count() }).from(media),
      db
        .select({ slug: posts.slug, title: posts.title, status: posts.status, dateCreated: posts.dateCreated })
        .from(posts)
        .orderBy(desc(posts.dateCreated))
        .limit(5),
    ]);

  const stats = [
    { label: "posts", count: postCount[0].value, href: "/admin/posts" },
    { label: "projects", count: projectCount[0].value, href: "/admin/projects" },
    { label: "media", count: mediaCount[0].value, href: "/admin/media" },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-medium mb-6">dashboard</h1>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="border border-border p-4 hover:border-primary transition-colors"
          >
            <div className="text-2xl font-medium text-primary">{stat.count}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </Link>
        ))}
      </div>

      <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border">
        recent posts
      </h2>
      <div className="space-y-0">
        {recentPosts.map((post) => (
          <div
            key={post.slug}
            className="flex items-center gap-3 py-2 hover:bg-muted/30 transition-colors"
          >
            <StatusToggle slug={post.slug} status={post.status} apiPath="posts" />
            <Link
              href={`/admin/posts/${post.slug}/edit`}
              className="text-sm flex-1 truncate hover:text-primary transition-colors"
            >
              {post.title}
            </Link>
            <span className={`text-xs ${post.status === "published" ? "text-green-500" : "text-yellow-500"}`}>
              {post.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
