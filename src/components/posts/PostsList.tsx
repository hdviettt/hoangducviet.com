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

// Sort key for an item: ISO date string (lexicographic == chronological).
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
    <div className="pt-16 sm:pt-24 md:pt-32 pb-24 md:pb-32">
      <span className="deck-label">archive</span>
      <h1 className="deck-display text-5xl sm:text-6xl md:text-7xl mb-16 sm:mb-20 md:mb-28">
        writing.
      </h1>

      {itemsByYear.length === 0 ? (
        <p className="text-muted-foreground">No articles found.</p>
      ) : (
        <div className="space-y-16 sm:space-y-20 md:space-y-28">
          {itemsByYear.map(({ year, items: yearItems }) => (
            <section key={year}>
              <h2 className="deck-label !text-base">{year}</h2>

              <ul className="divide-y divide-border/50 [&>li]:py-1 first:[&>li]:pt-0 last:[&>li]:pb-0">
                {yearItems.map((item, idx) => {
                  if (item.kind === "series") {
                    return (
                      <li key={`series-${item.project.slug}`}>
                        <SeriesBlock
                          project={item.project}
                          parts={item.parts}
                          firstDate={item.firstDate}
                          lastDate={item.lastDate}
                        />
                      </li>
                    );
                  }
                  const post = item.post;
                  const isUnpublished = post.status !== "published";
                  const d = post.date_created
                    ? new Date(post.date_created)
                    : null;
                  const date = d
                    ? d.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "";
                  return (
                    <li key={post.slug || idx}>
                      <Link
                        href={`/posts/${post.slug}`}
                        className={`block py-5 md:py-6 group ${
                          isUnpublished ? "opacity-40" : ""
                        }`}
                      >
                        <div className="flex items-baseline gap-6">
                          <span className="flex-1 min-w-0 text-xl md:text-2xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                            {post.title || "Untitled"}
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
