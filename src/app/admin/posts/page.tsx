import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import StatusToggle from "@/components/admin/StatusToggle";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const allPosts = await db.select().from(posts).orderBy(desc(posts.dateCreated));

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium">posts</h1>
        <Link
          href="/admin/posts/new"
          className="text-sm bg-primary text-primary-foreground px-4 py-1.5 hover:opacity-90 transition-opacity"
        >
          + new post
        </Link>
      </div>

      <div className="border border-border divide-y divide-border">
        {allPosts.map((post) => (
          <div
            key={post.slug}
            className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors"
          >
            <StatusToggle slug={post.slug} status={post.status} apiPath="posts" />
            <Link
              href={`/admin/posts/${post.slug}/edit`}
              className="text-sm flex-1 truncate hover:text-primary transition-colors"
            >
              {post.title}
            </Link>
            <span className={`text-xs ${post.status === "published" ? "text-green-500" : "text-yellow-500"}`}>
              {post.status}
            </span>
            <span className="text-xs text-muted-foreground w-24 text-right">
              {post.dateCreated?.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
            </span>
            <DeleteButton slug={post.slug} name={post.title} apiPath="posts" />
          </div>
        ))}
        {allPosts.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">no posts yet.</div>
        )}
      </div>
    </div>
  );
}
