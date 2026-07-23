import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import DeleteButton from "@/components/admin/DeleteButton";
import EmptyState from "@/components/admin/EmptyState";
import IdeaCapture from "@/components/admin/IdeaCapture";
import PageHeader from "@/components/admin/PageHeader";
import StatusToggle from "@/components/admin/StatusToggle";
import { db } from "@/db";
import { media, posts, series } from "@/db/schema";
import { count, eq, sql } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [postCount, seriesCount, mediaCount, drafts] = await Promise.all([
    db.select({ value: count() }).from(posts),
    db.select({ value: count() }).from(series),
    db.select({ value: count() }).from(media),
    db
      .select({
        slug: posts.slug,
        title: posts.title,
        status: posts.status,
        dateCreated: posts.dateCreated,
        dateUpdated: posts.dateUpdated,
      })
      .from(posts)
      .where(eq(posts.status, "draft"))
      .orderBy(sql`coalesce(${posts.dateUpdated}, ${posts.dateCreated}) desc`),
  ]);

  const stats = [
    {
      label: "Posts",
      count: postCount[0].value,
      href: "/admin/posts",
      icon: "description",
    },
    {
      label: "Series",
      count: seriesCount[0].value,
      href: "/admin/projects",
      icon: "folder",
    },
    {
      label: "Media",
      count: mediaCount[0].value,
      href: "/admin/media",
      icon: "image",
    },
  ];

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Dashboard"
        action={
          <span className="text-[13px] leading-[18px] text-md-on-surface-variant">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>
        }
      />

      {/* Quick idea capture — Enter saves it as a draft */}
      <IdeaCapture />

      {/* Drafts & ideas — your backlog to develop and publish */}
      <div className="flex items-center justify-between mt-8 mb-3">
        <h2 className="text-[13px] leading-[18px] text-md-on-surface-variant">
          Drafts and ideas{drafts.length > 0 ? ` · ${drafts.length}` : ""}
        </h2>
        <Link
          href="/admin/posts"
          className="text-[13px] leading-[18px] text-md-on-surface-variant hover:text-md-primary transition-colors"
        >
          All posts
        </Link>
      </div>
      <div className="border-t border-md-outline-variant">
        {drafts.length === 0 ? (
          <EmptyState
            icon="lightbulb"
            title="No drafts yet"
            hint="Capture an idea above to start one."
          />
        ) : (
          <div className="stagger-list">
            {drafts.map((d) => {
              const date = (d.dateUpdated ?? d.dateCreated)?.toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" },
              );
              return (
                <div
                  key={d.slug}
                  className="group flex items-center gap-3 py-3 border-b border-md-outline-variant"
                >
                  <StatusToggle
                    slug={d.slug}
                    status={d.status}
                    apiPath="posts"
                  />
                  <Link
                    href={`/admin/posts/${d.slug}/edit`}
                    className="text-[17px] leading-6 font-medium tracking-tight flex-1 truncate transition-colors group-hover:text-md-primary"
                  >
                    {d.title || "Untitled idea"}
                  </Link>
                  <span className="text-[13px] leading-[18px] text-md-on-surface-variant tabular-nums shrink-0">
                    {date}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <DeleteButton
                      slug={d.slug}
                      name={d.title || "this idea"}
                      apiPath="posts"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-md-outline-variant stagger-list">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group">
            <div className="text-[40px] leading-none font-medium tracking-tight text-md-on-surface tabular-nums transition-colors group-hover:text-md-primary">
              {stat.count}
            </div>
            <div className="text-[14px] leading-5 text-md-on-surface-variant mt-2">
              {stat.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Analytics */}
      <div className="mt-10">
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
