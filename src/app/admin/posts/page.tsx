import EmptyState from "@/components/admin/EmptyState";
import NewPostShortcut from "@/components/admin/NewPostShortcut";
import PostTable from "@/components/admin/PostTable";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const allPosts = await db
    .select({
      slug: posts.slug,
      title: posts.title,
      status: posts.status,
      description: posts.description,
      thumbnail: posts.thumbnail,
      dateCreated: posts.dateCreated,
      dateUpdated: posts.dateUpdated,
    })
    .from(posts)
    .orderBy(desc(posts.dateCreated));

  if (allPosts.length === 0) {
    return (
      <div className="max-w-[900px]">
        <NewPostShortcut href="/admin/posts/new" />
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
      </div>
    );
  }

  return (
    <div className="max-w-[900px]">
      <NewPostShortcut href="/admin/posts/new" />
      <PostTable rows={allPosts} />
    </div>
  );
}
