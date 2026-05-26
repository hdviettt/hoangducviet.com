"use client";

import { Icon } from "@/components/ui/Icon";
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
      <span className="md-label-medium uppercase tracking-widest text-md-on-surface-variant mb-3 block">
        archive
      </span>
      <h1 className="text-4xl sm:text-5xl md:text-[57px] md:leading-[64px] font-normal tracking-tight text-md-on-surface mb-12 sm:mb-16 md:mb-20">
        writing
      </h1>

      {itemsByYear.length === 0 ? (
        <p className="md-body-medium text-md-on-surface-variant">
          No articles found.
        </p>
      ) : (
        <div className="space-y-14 md:space-y-20">
          {itemsByYear.map(({ year, items: yearItems }) => (
            <section key={year}>
              <h2 className="text-2xl md:text-[28px] md:leading-9 font-medium tracking-tight text-md-on-surface mb-6 md:mb-8">
                {year}
              </h2>

              <div className="grid gap-4 md:gap-5 md:grid-cols-2">
                {yearItems.map((item) => {
                  if (item.kind === "series") {
                    return (
                      <SeriesBlock
                        key={`series-${item.series.slug}`}
                        series={item.series}
                        parts={item.parts}
                        firstDate={item.firstDate}
                        lastDate={item.lastDate}
                      />
                    );
                  }
                  const post = item.post;
                  const date = post.date_created
                    ? new Date(post.date_created).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "";
                  return (
                    <Link
                      key={post.slug}
                      href={`/posts/${post.slug}`}
                      className="group flex flex-col p-6 rounded-2xl border border-md-outline-variant bg-md-surface-container-low hover:bg-md-surface-container hover:shadow-md-1 transition-all duration-200 ease-md-standard"
                    >
                      <span className="md-label-small tabular-nums text-md-on-surface-variant mb-3">
                        {date}
                      </span>
                      <h3 className="md-title-large md:text-2xl md:leading-8 font-medium tracking-tight text-md-on-surface group-hover:text-primary transition-colors duration-200">
                        {post.title}
                      </h3>
                      {post.description && (
                        <p className="mt-3 md-body-medium text-md-on-surface-variant line-clamp-3">
                          {post.description}
                        </p>
                      )}
                      <span className="mt-auto pt-5 inline-flex items-center gap-1 md-label-medium text-md-on-surface-variant group-hover:text-primary transition-colors duration-200">
                        Read post
                        <Icon
                          name="arrow_forward"
                          size={16}
                          className="transition-transform duration-200 group-hover:translate-x-0.5"
                        />
                      </span>
                    </Link>
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
