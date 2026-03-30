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

interface PostsByMonth {
  year: number;
  month: number;
  label: string;
  posts: Post[];
}

interface PostsByYear {
  year: number;
  months: PostsByMonth[];
}

export default function PostsList({ posts }: PostsListProps) {
  const postsByYear = useMemo(() => {
    const sorted = [...posts].sort(
      (a, b) =>
        new Date(b.date_created || 0).getTime() -
        new Date(a.date_created || 0).getTime(),
    );

    const yearMap = new Map<number, Map<number, Post[]>>();
    const yearOrder: number[] = [];

    for (const post of sorted) {
      const d = post.date_created ? new Date(post.date_created) : null;
      const year = d ? d.getFullYear() : 0;
      const month = d ? d.getMonth() : 0; // 0-indexed

      if (!yearMap.has(year)) {
        yearMap.set(year, new Map());
        yearOrder.push(year);
      }
      const monthMap = yearMap.get(year)!;
      if (!monthMap.has(month)) {
        monthMap.set(month, []);
      }
      monthMap.get(month)!.push(post);
    }

    const result: PostsByYear[] = [];
    for (const year of yearOrder) {
      const monthMap = yearMap.get(year)!;
      const monthOrder = Array.from(monthMap.keys()).sort((a, b) => b - a);
      const months: PostsByMonth[] = monthOrder.map((month) => ({
        year,
        month,
        label: new Date(year, month, 1).toLocaleDateString("en-US", {
          month: "long",
        }),
        posts: monthMap.get(month)!,
      }));
      result.push({ year, months });
    }

    return result;
  }, [posts]);

  return (
    <div className="py-8 sm:py-12 md:py-16">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-medium mb-8 sm:mb-10 md:mb-12">Posts</h1>

      {postsByYear.length === 0 ? (
        <p className="text-muted-foreground text-sm md:text-base">No articles found.</p>
      ) : (
        <div className="space-y-10 sm:space-y-12 md:space-y-16">
          {postsByYear.map(({ year, months }) => (
            <section key={year}>
              {/* Year header */}
              <h2 className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground mb-6 md:mb-8 pb-2 border-b border-border">
                {year}
              </h2>

              {/* Months */}
              <div className="space-y-1 md:space-y-1.5">
                {months.map(({ month, label, posts: monthPosts }) =>
                  monthPosts.map((post, index) => {
                    const isUnpublished = post.status !== "published";
                    const d = post.date_created ? new Date(post.date_created) : null;
                    const day = d
                      ? `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`
                      : "";

                    return (
                      <div key={`${month}-${post.slug || index}`}>
                        <Link
                          href={`/posts/${post.slug}`}
                          className={`flex items-baseline gap-4 py-1.5 md:py-2 group text-sm md:text-base ${
                            isUnpublished ? "opacity-40" : ""
                          }`}
                        >
                          <span className="text-muted-foreground/40 text-xs md:text-sm w-16 md:w-20 shrink-0 text-right">
                            {index === 0 ? label : ""}
                          </span>
                          <span className="text-muted-foreground/50 text-xs md:text-sm w-20 md:w-24 shrink-0">
                            {day}
                          </span>
                          <span className="text-foreground group-hover:text-primary transition-colors">
                            {post.title || "Untitled"}
                          </span>
                        </Link>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
