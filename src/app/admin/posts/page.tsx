import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import StatusToggle from "@/components/admin/StatusToggle";
import DeleteButton from "@/components/admin/DeleteButton";
import EmptyState, { StatusPill } from "@/components/admin/EmptyState";
import PageHeader from "@/components/admin/PageHeader";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const allPosts = await db.select().from(posts).orderBy(desc(posts.dateCreated));

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="posts"
        count={allPosts.length}
        action={
          <Link href="/admin/posts/new" className="md-btn md-btn-filled md-btn-sm">
            <span>+ new post</span>
            <kbd className="md-label-small font-sans rounded bg-md-on-primary/20 px-1.5 py-0.5 leading-none">
              N
            </kbd>
          </Link>
        }
      />

      <div className="rounded-xl border border-md-outline-variant bg-md-surface-container-low overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-2.5 border-b border-md-outline-variant bg-md-surface-container">
          <div className="w-9 shrink-0" />
          <div className="md-label-small text-md-on-surface-variant uppercase tracking-widest flex-1">title</div>
          <div className="md-label-small text-md-on-surface-variant uppercase tracking-widest w-24">status</div>
          <div className="md-label-small text-md-on-surface-variant uppercase tracking-widest w-24 text-right">date</div>
          <div className="w-10 shrink-0" />
        </div>
        {allPosts.length === 0 ? (
          <EmptyState
            title="no posts yet"
            hint={
              <>
                press{" "}
                <kbd className="font-sans rounded bg-md-on-surface/8 px-1.5 py-0.5 md-label-small">N</kbd>{" "}
                or click{" "}
                <Link href="/admin/posts/new" className="text-md-primary hover:underline">
                  + new post
                </Link>
              </>
            }
          />
        ) : (
          <div className="divide-y divide-md-outline-variant stagger-list">
            {allPosts.map((post) => (
              <div
                key={post.slug}
                className="group flex items-center gap-4 px-4 py-2.5 row-hover"
              >
                <StatusToggle slug={post.slug} status={post.status} apiPath="posts" />
                <Link
                  href={`/admin/posts/${post.slug}/edit`}
                  className="md-body-medium flex-1 truncate hover:text-md-primary transition-colors"
                >
                  {post.title}
                </Link>
                <div className="w-24">
                  <StatusPill status={post.status} />
                </div>
                <span className="md-body-small text-md-on-surface-variant w-24 text-right shrink-0 tabular-nums">
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
