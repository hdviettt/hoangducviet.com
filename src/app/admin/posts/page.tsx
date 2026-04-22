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
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium">posts</h1>
          <span className="text-xs text-muted-foreground border border-border px-1.5 py-0.5 tabular-nums">{allPosts.length}</span>
        </div>
        <Link
          href="/admin/posts/new"
          className="text-sm bg-primary text-primary-foreground px-4 py-1.5 hover:opacity-90 transition-opacity btn-press"
        >
          + new post
        </Link>
      </div>

      <div className="border border-border bg-card">
        <div className="flex items-center gap-4 px-4 py-2 border-b border-border bg-muted/30 border-l-2 border-l-transparent">
          <div className="w-9 shrink-0" />
          <div className="text-xs text-muted-foreground uppercase tracking-wider flex-1">title</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider w-28">status</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider w-24 text-right">date</div>
          <div className="w-10 shrink-0" />
        </div>
        <div className="divide-y divide-border stagger-list">
          {allPosts.map((post) => (
            <div
              key={post.slug}
              className="flex items-center gap-4 px-4 py-3 row-hover"
            >
              <StatusToggle slug={post.slug} status={post.status} apiPath="posts" />
              <Link
                href={`/admin/posts/${post.slug}/edit`}
                className="text-sm flex-1 truncate hover:text-primary transition-colors"
              >
                {post.title}
              </Link>
              <span className={`text-xs flex items-center gap-1.5 w-28 ${post.status === "published" ? "text-green-500" : "text-yellow-500"}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${post.status === "published" ? "bg-green-500" : "bg-yellow-500"}`} />
                {post.status}
              </span>
              <span className="text-xs text-muted-foreground w-24 text-right shrink-0">
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
    </div>
  );
}
