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
        .select({
          slug: posts.slug,
          title: posts.title,
          status: posts.status,
          dateCreated: posts.dateCreated,
        })
        .from(posts)
        .orderBy(desc(posts.dateCreated))
        .limit(5),
    ]);

  const stats = [
    { label: "Posts", count: postCount[0].value, href: "/admin/posts" },
    { label: "Pages", count: pageCount[0].value, href: "/admin/pages" },
    {
      label: "Projects",
      count: projectCount[0].value,
      href: "/admin/projects",
    },
    { label: "Media", count: mediaCount[0].value, href: "/admin/media" },
  ];

  return (
    <div>
      <h1 className="text-xl font-medium mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="border border-border p-4 hover:border-primary transition-colors"
          >
            <div className="text-2xl font-medium text-primary">
              {stat.count}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              {stat.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="border border-border">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-medium uppercase tracking-wider">
            Recent Posts
          </h2>
        </div>
        <div className="divide-y divide-border">
          {recentPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/admin/posts/${post.slug}/edit`}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm">{post.title}</span>
              <span
                className={`text-xs px-2 py-0.5 ${
                  post.status === "published"
                    ? "text-green-500 bg-green-500/10"
                    : "text-yellow-500 bg-yellow-500/10"
                }`}
              >
                {post.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
