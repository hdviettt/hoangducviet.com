"use client";

import type { FeedItem } from "@/lib/posts";
import { useMemo } from "react";
import FeedRow from "./FeedRow";

interface PostsListProps {
  items: FeedItem[];
  viewCounts: Record<string, number>;
}

function itemDate(item: FeedItem): string {
  return item.kind === "series" ? item.lastDate : item.post.date_created || "";
}

// deepmind.google archive: display header + one continuous hairline list.
export default function PostsList({ items, viewCounts }: PostsListProps) {
  const sorted = useMemo(
    () => [...items].sort((a, b) => itemDate(b).localeCompare(itemDate(a))),
    [items],
  );

  const seriesViewTotal = (item: Extract<FeedItem, { kind: "series" }>) =>
    item.parts.reduce((sum, p) => sum + (viewCounts[p.slug] ?? 0), 0);

  return (
    <div className="pt-12 sm:pt-16 md:pt-20 pb-16 md:pb-20">
      <h1 className="text-[36px] leading-[44px] md:text-[57px] md:leading-[62px] font-normal tracking-tight text-md-on-surface">
        Writing
      </h1>
      <p className="mt-2 md:mt-3 text-[22px] leading-7 md:text-[28px] md:leading-9 font-normal text-md-on-surface-variant max-w-[820px] mb-10 md:mb-14">
        Every post and series, newest first
      </p>

      {sorted.length === 0 ? (
        <p className="md-body-medium text-md-on-surface-variant">
          Nothing published yet.
        </p>
      ) : (
        <div className="max-w-[880px] divide-y divide-md-outline-variant border-t border-b border-md-outline-variant">
          {sorted.map((item) => (
            <FeedRow
              key={
                item.kind === "series"
                  ? `series-${item.series.slug}`
                  : item.post.slug
              }
              item={item}
              views={
                item.kind === "series"
                  ? seriesViewTotal(item)
                  : (viewCounts[item.post.slug ?? ""] ?? 0)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
