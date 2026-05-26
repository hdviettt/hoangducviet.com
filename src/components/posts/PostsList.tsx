"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { FeedItem } from "@/lib/posts";
import SeriesBlock from "./SeriesBlock";

interface PostsListProps {
  items: FeedItem[];
}

interface ItemsByYear {
  year: number;
  items: FeedItem[];
}

function itemDate(item: FeedItem): string {
  return item.kind === "series"
    ? item.lastDate
    : item.post.date_created || "";
}

function itemYear(item: FeedItem): number {
  const iso = itemDate(item);
  return iso ? new Date(iso).getFullYear() : 0;
}

export default function PostsList({ items }: PostsListProps) {
  const itemsByYear = useMemo<ItemsByYear[]>(() => {
    const sorted = [...items].sort((a, b) =>
      itemDate(b).localeCompare(itemDate(a)),
    );
    const yearMap = new Map<number, FeedItem[]>();
    const yearOrder: number[] = [];
    for (const item of sorted) {
      const y = itemYear(item);
      if (!yearMap.has(y)) {
        yearMap.set(y, []);
        yearOrder.push(y);
      }
      yearMap.get(y)!.push(item);
    }
    return yearOrder.map((year) => ({ year, items: yearMap.get(year)! }));
  }, [items]);

  return (
    <div className="pt-12 sm:pt-16 md:pt-20 pb-16 md:pb-20">
      <span className="deck-label">archive</span>
      <h1 className="deck-display text-4xl sm:text-5xl md:text-6xl mb-12 sm:mb-16 md:mb-20">
        writing.
      </h1>

      {itemsByYear.length === 0 ? (
        <p className="text-muted-foreground text-sm">No articles found.</p>
      ) : (
        <div className="space-y-12 sm:space-y-16">
          {itemsByYear.map(({ year, items: yearItems }) => (
            <section key={year}>
              <h2 className="text-sm md:text-base font-semibold uppercase tracking-widest text-foreground/55 mb-4 md:mb-6 pb-3 border-b border-border/50">
                {year}
              </h2>

              <ul className="[&>li]:py-1 first:[&>li]:pt-0 last:[&>li]:pb-0">
                {yearItems.map((item) => {
                  if (item.kind === "series") {
                    return (
                      <li key={`series-${item.series.slug}`}>
                        <SeriesBlock
                          series={item.series}
                          parts={item.parts}
                          firstDate={item.firstDate}
                          lastDate={item.lastDate}
                        />
                      </li>
                    );
                  }
                  const post = item.post;
                  const date = post.date_created
                    ? new Date(post.date_created).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "";
                  return (
                    <li key={post.slug}>
                      <Link
                        href={`/posts/${post.slug}`}
                        className="block py-5 md:py-6 group"
                      >
                        <div className="flex items-baseline gap-6">
                          <span className="flex-1 min-w-0 text-xl md:text-2xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                            {post.title}
                          </span>
                          <span className="text-xs md:text-sm tabular-nums text-muted-foreground/60 shrink-0">
                            {date}
                          </span>
                        </div>
                        {post.description && (
                          <p className="mt-2 text-sm text-foreground/60 leading-relaxed max-w-2xl">
                            {post.description}
                          </p>
                        )}
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
