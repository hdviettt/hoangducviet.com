import AdminRow, { adminDate } from "@/components/admin/AdminRow";
import DeleteButton from "@/components/admin/DeleteButton";
import EmptyState from "@/components/admin/EmptyState";
import NewPostShortcut from "@/components/admin/NewPostShortcut";
import PageHeader from "@/components/admin/PageHeader";
import StatusToggle from "@/components/admin/StatusToggle";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const allPosts = await db
    .select()
    .from(posts)
    .orderBy(desc(posts.dateCreated));

  const drafts = allPosts.filter((p) => p.status !== "published").length;

  return (
    <div className="max-w-[900px]">
      <NewPostShortcut href="/admin/posts/new" />
      <PageHeader
        title="Posts"
        count={allPosts.length}
        action={
          <Link
            href="/admin/posts/new"
            className="md-btn md-btn-filled md-btn-sm"
          >
            <span>New post</span>
            <kbd className="text-[12px] leading-4 font-sans rounded bg-md-on-primary/20 px-1.5 py-0.5 leading-none">
              N
            </kbd>
          </Link>
        }
      />

      {drafts > 0 && (
        <p className="-mt-4 mb-6 text-[14px] leading-5 text-md-on-surface-variant">
          {drafts} of these {drafts === 1 ? "is a draft" : "are drafts"} — only
          you can see {drafts === 1 ? "it" : "them"}.
        </p>
      )}

      {allPosts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          hint={
            <>
              Press{" "}
              <kbd className="font-sans rounded bg-md-on-surface/8 px-1.5 py-0.5 text-[12px] leading-4">
                N
              </kbd>{" "}
              or click{" "}
              <Link
                href="/admin/posts/new"
                className="text-md-primary hover:underline"
              >
                New post
              </Link>
            </>
          }
        />
      ) : (
        <div className="border-t border-md-outline-variant stagger-list">
          {allPosts.map((post) => {
            const isDraft = post.status !== "published";
            return (
              <AdminRow
                key={post.slug}
                href={`/admin/posts/${post.slug}/edit`}
                title={post.title}
                description={post.description}
                thumbnail={post.thumbnail}
                muted={isDraft}
                meta={
                  <>
                    <span className="tabular-nums">
                      {adminDate(post.dateCreated)}
                    </span>
                    {isDraft && (
                      <span className="text-md-on-surface-variant">Draft</span>
                    )}
                    {!post.description && (
                      <span className="text-md-warning">No description</span>
                    )}
                    {!post.thumbnail && (
                      <span className="text-md-warning">No cover</span>
                    )}
                  </>
                }
                actions={
                  <>
                    <StatusToggle
                      slug={post.slug}
                      status={post.status}
                      apiPath="posts"
                    />
                    <DeleteButton
                      slug={post.slug}
                      name={post.title}
                      apiPath="posts"
                    />
                  </>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
