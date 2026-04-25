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
    <div className="pt-16 sm:pt-24 md:pt-32 pb-24 md:pb-32">
      <span className="deck-label">archive</span>
      <h1 className="deck-display text-5xl sm:text-6xl md:text-7xl mb-20 md:mb-28">
        writing.
      </h1>

      {postsByYear.length === 0 ? (
        <p className="text-muted-foreground">No articles found.</p>
      ) : (
        <div className="space-y-20 md:space-y-28">
          {postsByYear.map(({ year, posts: yearPosts }) => (
            <section key={year}>
              <h2 className="deck-label !text-base">{year}</h2>

              <ul className="divide-y divide-border/50">
                {yearPosts.map((post, index) => {
                  const isUnpublished = post.status !== "published";
                  const d = post.date_created ? new Date(post.date_created) : null;
                  const date = d
                    ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "";

                  return (
                    <li key={post.slug || index}>
                      <Link
                        href={`/posts/${post.slug}`}
                        className={`flex items-baseline gap-6 py-5 md:py-6 group ${
                          isUnpublished ? "opacity-40" : ""
                        }`}
                      >
                        <span className="flex-1 min-w-0 text-xl md:text-2xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                          {post.title || "Untitled"}
                        </span>
                        <span className="text-xs md:text-sm tabular-nums text-muted-foreground/60 shrink-0">
                          {date}
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
