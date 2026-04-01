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

    const yearMap = new Map<number, Post[]>();
    const yearOrder: number[] = [];

    for (const post of sorted) {
      const d = post.date_created ? new Date(post.date_created) : null;
      const year = d ? d.getFullYear() : 0;

      if (!yearMap.has(year)) {
        yearMap.set(year, []);
        yearOrder.push(year);
      }
      yearMap.get(year)!.push(post);
    }

    return yearOrder.map((year) => ({ year, posts: yearMap.get(year)! }));
  }, [posts]);

  return (
    <div className="py-8 sm:py-12 md:py-16">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-medium mb-8 sm:mb-10 md:mb-12">Posts</h1>

      {postsByYear.length === 0 ? (
        <p className="text-muted-foreground text-sm md:text-base">No articles found.</p>
      ) : (
        <div className="space-y-10 sm:space-y-12 md:space-y-16">
          {postsByYear.map(({ year, posts: yearPosts }) => (
            <section key={year}>
              <h2 className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground mb-6 md:mb-8 pb-2 border-b border-border">
                {year}
              </h2>

              <div className="space-y-1 md:space-y-1.5">
                {yearPosts.map((post, index) => {
                  const isUnpublished = post.status !== "published";
                  const d = post.date_created ? new Date(post.date_created) : null;
                  const date = d
                    ? d.toLocaleDateString("en-US", { month: "short", day: "2-digit" })
                    : "";

                  return (
                    <div key={post.slug || index}>
                      <Link
                        href={`/posts/${post.slug}`}
                        className={`flex items-baseline gap-4 py-1.5 md:py-2 group text-sm md:text-base ${
                          isUnpublished ? "opacity-40" : ""
                        }`}
                      >
                        <span className="text-muted-foreground/50 text-xs md:text-sm w-14 shrink-0">
                          {date}
                        </span>
                        <span className="text-foreground group-hover:text-primary transition-colors">
                          {post.title || "Untitled"}
                        </span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
