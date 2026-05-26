import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import StatusToggle from "@/components/admin/StatusToggle";
import DeleteButton from "@/components/admin/DeleteButton";
import EmptyState, { StatusPill } from "@/components/admin/EmptyState";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const allPosts = await db.select().from(posts).orderBy(desc(posts.dateCreated));

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium">posts</h1>
          <span className="text-xs text-muted-foreground border border-border px-1.5 py-0.5 tabular-nums font-mono">
            {allPosts.length}
          </span>
        </div>
        <Link
          href="/admin/posts/new"
          className="md-btn md-btn-filled md-btn-sm"
        >
          <span>+ new post</span>
          <kbd className="md-label-small opacity-60 border border-primary-foreground/30 px-1">N</kbd>
        </Link>
      </div>

      <div className="border border-border bg-card">
        <div className="flex items-center gap-4 px-4 py-2 border-b border-border bg-muted/30 border-l-2 border-l-transparent">
          <div className="w-9 shrink-0" />
          <div className="md-label-small text-muted-foreground uppercase tracking-widest flex-1 font-semibold">title</div>
          <div className="md-label-small text-muted-foreground uppercase tracking-widest w-24 font-semibold">status</div>
          <div className="md-label-small text-muted-foreground uppercase tracking-widest w-24 text-right font-semibold">date</div>
          <div className="w-10 shrink-0" />
        </div>
        {allPosts.length === 0 ? (
          <EmptyState
            title="no posts yet"
            hint={
              <>
                press{" "}
                <kbd className="font-mono border border-border px-1 py-0.5 md-label-small">N</kbd>{" "}
                or click{" "}
                <Link href="/admin/posts/new" className="text-primary hover:underline">
                  + new post
                </Link>
              </>
            }
          />
        ) : (
          <div className="divide-y divide-border stagger-list">
            {allPosts.map((post) => (
              <div
                key={post.slug}
                className="group flex items-center gap-4 px-4 py-2.5 row-hover"
              >
                <StatusToggle slug={post.slug} status={post.status} apiPath="posts" />
                <Link
                  href={`/admin/posts/${post.slug}/edit`}
                  className="text-sm flex-1 truncate hover:text-primary transition-colors"
                >
                  {post.title}
                </Link>
                <div className="w-24">
                  <StatusPill status={post.status} />
                </div>
                <span className="text-xs text-muted-foreground w-24 text-right shrink-0 font-mono tabular-nums">
                  {post.dateCreated?.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "2-digit" })}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteButton slug={post.slug} name={post.title} apiPath="posts" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
