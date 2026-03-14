import { db } from "@/db";
import { media, pages, posts, projects } from "@/db/schema";
import { count, desc } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [postCount, pageCount, projectCount, mediaCount, recentPosts] =
    await Promise.all([
      db.select({ value: count() }).from(posts),
      db.select({ value: count() }).from(pages),
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
    { label: "pages", count: pageCount[0].value, href: "/admin/pages" },
    { label: "projects", count: projectCount[0].value, href: "/admin/projects" },
    { label: "media", count: mediaCount[0].value, href: "/admin/media" },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-medium mb-6">dashboard</h1>

      <div className="grid grid-cols-4 gap-3 mb-8">
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
          <Link
            key={post.slug}
            href={`/admin/posts/${post.slug}/edit`}
            className="flex items-center justify-between py-2 hover:text-primary transition-colors group"
          >
            <span className="text-sm">{post.title}</span>
            <span className={`text-xs ${post.status === "published" ? "text-green-500" : "text-yellow-500"}`}>
              {post.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
