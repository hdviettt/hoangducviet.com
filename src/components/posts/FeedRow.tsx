import Link from "next/link";

import { ViewCount } from "@/components/posts/ViewCount";
import { Icon } from "@/components/ui/Icon";
import type { FeedItem } from "@/lib/posts";

// deepmind.google list row: title + meta line + optional small thumbnail on the
// right, hairline dividers between rows, no description (the title carries it).
export function feedRowDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function FeedRow({
  item,
  views,
}: {
  item: FeedItem;
  views: number;
}) {
  const isSeries = item.kind === "series";
  const href = isSeries
    ? `/series/${item.series.slug}`
    : `/posts/${item.post.slug}`;
  const title = isSeries ? item.series.title : item.post.title;
  const date = feedRowDate(isSeries ? item.lastDate : item.post.date_created);
  const thumbnail = isSeries ? null : item.post.thumbnail || null;
  const cta = isSeries ? "View series" : "Read post";

  return (
    <Link href={href} className="group flex items-center gap-8 py-8 md:py-10">
      <div className="min-w-0 flex-1">
        <h3 className="text-[22px] leading-7 md:text-[28px] md:leading-9 font-normal tracking-tight text-md-on-surface group-hover:text-primary transition-colors duration-200 ease-md-standard">
          {title}
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] leading-5 text-md-on-surface-variant">
          <span className="tabular-nums">{date}</span>
          {isSeries && (
            <span>Series · {item.parts.length} parts</span>
          )}
          {views > 0 && <ViewCount count={views} />}
          <span className="inline-flex items-center gap-1.5 text-md-on-surface font-medium">
            {cta}
            <Icon
              name="arrow_forward"
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
      {thumbnail && (
        <div className="hidden sm:block shrink-0 w-[180px] md:w-[240px] aspect-square overflow-hidden rounded-[var(--md-sys-shape-corner-large-increased)] bg-md-surface-container">
          {/* biome-ignore lint/a11y/useAltText: decorative thumbnail, title is adjacent */}
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-300 ease-md-standard group-hover:scale-[1.03]"
          />
        </div>
      )}
    </Link>
  );
}
