import { db } from "@/db";
import { media, posts, projects } from "@/db/schema";
import { count, desc } from "drizzle-orm";
import { FileText, FolderKanban, Image } from "lucide-react";
import Link from "next/link";
import StatusToggle from "@/components/admin/StatusToggle";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";

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
    { label: "posts", count: postCount[0].value, href: "/admin/posts", icon: FileText },
    { label: "projects", count: projectCount[0].value, href: "/admin/projects", icon: FolderKanban },
    { label: "media", count: mediaCount[0].value, href: "/admin/media", icon: Image },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-medium mb-6">dashboard</h1>

      <div className="grid grid-cols-3 gap-3 mb-8 stagger-list">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group border border-border p-4 stat-card btn-press relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-[scanLine_2s_ease-in-out_infinite]" />
            </div>
            <div className="flex items-center justify-between relative">
              <div>
                <div className="text-2xl font-medium text-primary">{stat.count}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
              <stat.icon className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border">
        recent posts
      </h2>
      <div className="space-y-0 stagger-list">
        {recentPosts.map((post) => (
          <div
            key={post.slug}
            className="flex items-center gap-3 py-2 px-2 row-hover"
          >
            <StatusToggle slug={post.slug} status={post.status} apiPath="posts" />
            <Link
              href={`/admin/posts/${post.slug}/edit`}
              className="text-sm flex-1 truncate hover:text-primary transition-colors"
            >
              {post.title}
            </Link>
            <span className={`text-xs flex items-center gap-1.5 ${post.status === "published" ? "text-green-500" : "text-yellow-500"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${post.status === "published" ? "bg-green-500" : "bg-yellow-500"}`} />
              {post.status}
            </span>
          </div>
        ))}
      </div>

      <AnalyticsDashboard />
    </div>
  );
}
