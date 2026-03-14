"use client";

import Link from "next/link";
import { useMemo } from "react";

interface Post {
  slug?: string;
  title?: string;
  date_created?: string;
  status?: string;
}

interface PostsListProps {
  posts: Post[];
  categories?: string[];
}

interface PostsByYear {
  year: number;
  posts: Post[];
}

export default function PostsList({ posts }: PostsListProps) {
  const postsByYear = useMemo(() => {
    const sorted = [...posts].sort(
      (a, b) =>
        new Date(b.date_created || 0).getTime() -
        new Date(a.date_created || 0).getTime(),
    );

    const grouped: PostsByYear[] = [];
    let currentYear: number | null = null;

    for (const post of sorted) {
      const year = post.date_created
        ? new Date(post.date_created).getFullYear()
        : 0;
      if (year !== currentYear) {
        currentYear = year;
        grouped.push({ year, posts: [] });
      }
      grouped[grouped.length - 1].posts.push(post);
    }

    return grouped;
  }, [posts]);

  return (
    <div className="py-8 sm:py-12">
      <h1 className="text-xl sm:text-2xl font-medium mb-8 sm:mb-10">Posts</h1>

      {postsByYear.length === 0 ? (
        <p className="text-muted-foreground text-sm">No articles found.</p>
      ) : (
        <div className="space-y-8 sm:space-y-10">
          {postsByYear.map(({ year, posts: yearPosts }) => (
            <section key={year}>
              {/* Year header */}
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b border-border">
                {year}
              </h2>

              {/* Posts list */}
              <ul className="space-y-2">
                {yearPosts.map((post, index) => {
                  const isUnpublished = post.status !== "published";
                  const date = post.date_created
                    ? new Date(post.date_created).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                      })
                    : "";

                  return (
                    <li key={post.slug || index}>
                      <Link
                        href={`/posts/${post.slug}`}
                        className={`flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-1.5 group text-sm ${
                          isUnpublished ? "opacity-40" : ""
                        }`}
                      >
                        <span className="text-muted-foreground text-xs w-16 shrink-0 order-2 sm:order-1">
                          {date}
                        </span>
                        <span className="text-foreground group-hover:text-primary transition-colors order-1 sm:order-2">
                          {post.title || "Untitled"}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
