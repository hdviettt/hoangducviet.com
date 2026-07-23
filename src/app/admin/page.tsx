import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import DeleteButton from "@/components/admin/DeleteButton";
import EmptyState from "@/components/admin/EmptyState";
import IdeaCapture from "@/components/admin/IdeaCapture";
import PageHeader from "@/components/admin/PageHeader";
import StatusToggle from "@/components/admin/StatusToggle";
import { Icon } from "@/components/ui/Icon";
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
      label: "posts",
      count: postCount[0].value,
      href: "/admin/posts",
      icon: "description",
    },
    {
      label: "series",
      count: seriesCount[0].value,
      href: "/admin/projects",
      icon: "folder",
    },
    {
      label: "media",
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
          <span className="md-body-small text-md-on-surface-variant">
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
        <h2 className="md-label-medium uppercase tracking-wider text-md-on-surface-variant">
          drafts &amp; ideas{drafts.length > 0 ? ` · ${drafts.length}` : ""}
        </h2>
        <Link
          href="/admin/posts"
          className="md-label-medium text-md-on-surface-variant hover:text-md-primary transition-colors"
        >
          all posts →
        </Link>
      </div>
      <div className="rounded-xl border border-md-outline-variant bg-md-surface-container-low overflow-hidden">
        {drafts.length === 0 ? (
          <EmptyState
            icon="lightbulb"
            title="No drafts yet"
            hint="Capture an idea above to start one."
          />
        ) : (
          <div className="divide-y divide-md-outline-variant stagger-list">
            {drafts.map((d) => {
              const date = (d.dateUpdated ?? d.dateCreated)?.toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" },
              );
              return (
                <div
                  key={d.slug}
                  className="group flex items-center gap-3 px-3 py-2.5 row-hover"
                >
                  <StatusToggle
                    slug={d.slug}
                    status={d.status}
                    apiPath="posts"
                  />
                  <Link
                    href={`/admin/posts/${d.slug}/edit`}
                    className="md-body-medium flex-1 truncate hover:text-md-primary transition-colors"
                  >
                    {d.title || "(untitled idea)"}
                  </Link>
                  <span className="md-body-small text-md-on-surface-variant tabular-nums shrink-0">
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
      <div className="grid grid-cols-3 gap-3 mt-8 stagger-list">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group relative overflow-hidden rounded-xl border border-md-outline-variant bg-md-surface-container-low p-5 transition-shadow hover:shadow-md-1"
          >
            <Icon
              name={stat.icon}
              size={40}
              className="absolute right-4 bottom-3 text-md-outline-variant group-hover:text-md-primary/25 transition-colors"
            />
            <div className="relative">
              <div className="text-[32px] leading-none font-medium text-md-primary tabular-nums">
                {stat.count}
              </div>
              <div className="md-label-medium text-md-on-surface-variant mt-2 uppercase tracking-wider">
                {stat.label}
              </div>
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
