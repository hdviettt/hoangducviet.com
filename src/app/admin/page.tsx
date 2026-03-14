import { db } from "@/db";
import { media, pages, posts, projects } from "@/db/schema";
import { count, desc } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [postCount, pageCount, projectCount, mediaCount, recentPosts] =
    await Promise.all([
      db.select({ value: count() }).from(posts),
      db.select({ value: count() }).from(pages),
      db.select({ value: count() }).from(projects),
      db.select({ value: count() }).from(media),
      db
        .select({
          slug: posts.slug,
          title: posts.title,
          status: posts.status,
          dateCreated: posts.dateCreated,
        })
        .from(posts)
        .orderBy(desc(posts.dateCreated))
        .limit(5),
    ]);

  const stats = [
    { label: "Posts", count: postCount[0].value, href: "/admin/posts" },
    { label: "Pages", count: pageCount[0].value, href: "/admin/pages" },
    { label: "Projects", count: projectCount[0].value, href: "/admin/projects" },
    { label: "Media", count: mediaCount[0].value, href: "/admin/media" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="admin-card group">
            <div className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">
              {stat.count}
            </div>
            <div className="text-xs text-[#888] mt-1">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="admin-card p-0">
        <div className="px-5 py-3 border-b border-[#222]">
          <h2 className="text-sm font-semibold text-[#aaa]">Recent Posts</h2>
        </div>
        {recentPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/admin/posts/${post.slug}/edit`}
            className="flex items-center justify-between px-5 py-3 border-b border-[#222] last:border-0 hover:bg-[#1a1a1a] transition-colors"
          >
            <span className="text-sm text-[#ccc]">{post.title}</span>
            <span
              className={`admin-badge ${post.status === "published" ? "admin-badge-green" : "admin-badge-yellow"}`}
            >
              {post.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
