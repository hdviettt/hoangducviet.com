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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="bg-primary text-primary-foreground px-4 py-2 text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
        >
          New Post
        </Link>
      </div>

      <div className="border border-border">
        <div className="grid grid-cols-[1fr_100px_120px_80px] px-4 py-2 border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
          <span>Title</span>
          <span>Status</span>
          <span>Date</span>
          <span>Actions</span>
        </div>
        <div className="divide-y divide-border">
          {allPosts.map((post) => (
            <div
              key={post.slug}
              className="grid grid-cols-[1fr_100px_120px_80px] px-4 py-3 items-center"
            >
              <Link
                href={`/admin/posts/${post.slug}/edit`}
                className="text-sm hover:text-primary transition-colors truncate"
              >
                {post.title}
              </Link>
              <span
                className={`text-xs px-2 py-0.5 w-fit ${
                  post.status === "published"
                    ? "text-green-500 bg-green-500/10"
                    : "text-yellow-500 bg-yellow-500/10"
                }`}
              >
                {post.status}
              </span>
              <span className="text-xs text-muted-foreground">
                {post.dateCreated?.toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}
              </span>
              <Link
                href={`/admin/posts/${post.slug}/edit`}
                className="text-xs text-primary hover:underline"
              >
                Edit
              </Link>
            </div>
          ))}
          {allPosts.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No posts yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
