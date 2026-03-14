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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-white">Posts</h1>
        <Link href="/admin/posts/new" className="admin-btn">
          New Post
        </Link>
      </div>

      <div className="admin-card p-0">
        <div className="grid grid-cols-[1fr_90px_110px_60px] px-5 py-2.5 border-b border-[#222] text-xs text-[#666] uppercase tracking-wider">
          <span>Title</span>
          <span>Status</span>
          <span>Date</span>
          <span />
        </div>
        {allPosts.map((post) => (
          <div
            key={post.slug}
            className="grid grid-cols-[1fr_90px_110px_60px] px-5 py-3 border-b border-[#222] last:border-0 items-center hover:bg-[#1a1a1a] transition-colors"
          >
            <Link
              href={`/admin/posts/${post.slug}/edit`}
              className="text-sm text-[#ccc] hover:text-white truncate"
            >
              {post.title}
            </Link>
            <span
              className={`admin-badge ${post.status === "published" ? "admin-badge-green" : "admin-badge-yellow"}`}
            >
              {post.status}
            </span>
            <span className="text-xs text-[#666]">
              {post.dateCreated?.toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}
            </span>
            <Link
              href={`/admin/posts/${post.slug}/edit`}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Edit
            </Link>
          </div>
        ))}
        {allPosts.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-[#666]">
            No posts yet.
          </div>
        )}
      </div>
    </div>
  );
}
