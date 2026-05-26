import { db } from "@/db";
import { media, posts, series } from "@/db/schema";
import { count, desc } from "drizzle-orm";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import StatusToggle from "@/components/admin/StatusToggle";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import EmptyState, { StatusPill } from "@/components/admin/EmptyState";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [postCount, projectCount, mediaCount, recentPosts] =
    await Promise.all([
      db.select({ value: count() }).from(posts),
      db.select({ value: count() }).from(series),
      db.select({ value: count() }).from(media),
      db
        .select({ slug: posts.slug, title: posts.title, status: posts.status, dateCreated: posts.dateCreated })
        .from(posts)
        .orderBy(desc(posts.dateCreated))
        .limit(5),
    ]);

  const stats = [
    { label: "posts", count: postCount[0].value, href: "/admin/posts", icon: "description" },
    { label: "projects", count: projectCount[0].value, href: "/admin/projects", icon: "folder" },
    { label: "media", count: mediaCount[0].value, href: "/admin/media", icon: "image" },
  ];

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">dashboard</h1>
        <span className="text-xs text-muted-foreground">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8 stagger-list">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group stat-card p-5 btn-press relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-[scanLine_2s_ease-in-out_infinite]" />
            </div>
            <Icon
              name={stat.icon}
              size={48}
              className="absolute right-4 bottom-3 text-border/60 group-hover:text-primary/15 transition-colors"
            />
            <div className="relative">
              <div className="text-3xl font-medium text-primary tabular-nums leading-none">{stat.count}</div>
              <div className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
        <h2 className="text-xs text-muted-foreground uppercase tracking-wider">recent posts</h2>
        <Link href="/admin/posts" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          view all →
        </Link>
      </div>
      <div className="rounded-xl border border-md-outline-variant bg-md-surface-container-low mb-8 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-md-outline-variant bg-md-surface-container">
          <div className="w-9 shrink-0" />
          <div className="md-label-small text-muted-foreground uppercase tracking-widest flex-1 font-semibold">title</div>
          <div className="md-label-small text-muted-foreground uppercase tracking-widest font-semibold">status</div>
        </div>
        {recentPosts.length === 0 ? (
          <EmptyState
            title="no posts yet"
            hint={
              <Link href="/admin/posts/new" className="text-primary hover:underline">
                + new post
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-border stagger-list">
            {recentPosts.map((post) => (
              <div
                key={post.slug}
                className="flex items-center gap-3 py-2 px-3 row-hover"
              >
                <StatusToggle slug={post.slug} status={post.status} apiPath="posts" />
                <Link
                  href={`/admin/posts/${post.slug}/edit`}
                  className="text-sm flex-1 truncate hover:text-primary transition-colors"
                >
                  {post.title}
                </Link>
                <StatusPill status={post.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      <AnalyticsDashboard />
    </div>
  );
}
