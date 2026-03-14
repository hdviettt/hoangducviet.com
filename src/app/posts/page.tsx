import { getPosts } from "@/lib/posts";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Posts",
};

export default async function PostsPage() {
  const posts = await getPosts({ withCategories: true });

  const postsByYear: Record<string, typeof posts> = {};
  for (const post of posts) {
    const year = post.date_created
      ? new Date(post.date_created).getFullYear().toString()
      : "Unknown";
    if (!postsByYear[year]) postsByYear[year] = [];
    postsByYear[year].push(post);
  }
  const years = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">Posts</h1>
      {years.map((year) => (
        <section key={year} className="mb-8">
          <h2 className="text-sm font-semibold text-neutral-400 mb-3">{year}</h2>
          <ul className="space-y-1">
            {postsByYear[year].map((post) => (
              <li key={post.slug} className="flex items-baseline gap-4">
                <span className="text-sm text-neutral-400 shrink-0 w-20">
                  {post.date_created
                    ? new Date(post.date_created).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : ""}
                </span>
                <Link
                  href={`/posts/${post.slug}`}
                  className="text-blue-600 hover:underline"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
