import Link from "next/link";

import { ViewCount } from "@/components/posts/ViewCount";
import type { FeedItem } from "@/lib/posts";

// deepmind.google list row: medium-weight title + description + meta line,
// top-aligned with the thumbnail on the right. No CTA link — the whole card
// is the link. Each row closes with a hairline (border-b from the parent).
export function feedRowDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  // UTC parts so server and client render the same string (no locale drift).
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getUTCFullYear()}`;
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
  const description = isSeries
    ? item.series.summary
    : item.post.description || null;

  return (
    // Mobile mirrors deepmind.google: full-width thumbnail on top, text
    // below; from sm up the thumbnail moves to the right, top-aligned.
    <Link
      href={href}
      className="group flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-8 py-8 md:py-10 transition-colors duration-200 ease-md-standard hover:bg-md-surface-container-low"
    >
      <div className="min-w-0 flex-1">
        <h3 className="text-[22px] leading-7 md:text-[28px] md:leading-9 font-medium tracking-tight text-md-on-surface group-hover:text-primary transition-colors duration-200 ease-md-standard">
          {title}
        </h3>
        {description && (
          <p className="mt-3 text-[16px] leading-[26px] text-md-on-surface-variant line-clamp-3">
            {description}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] leading-5 text-md-on-surface-variant">
          <span className="tabular-nums">{date}</span>
          {isSeries && <span>Series · {item.parts.length} parts</span>}
          {views > 0 && <ViewCount count={views} />}
        </div>
      </div>
      {/* inset hairline ring: near-white SVG covers dissolve into the page
          background without it — keeps every thumbnail a crisp frame */}
      {thumbnail && (
        <div className="order-first sm:order-none w-full sm:w-[220px] md:w-[260px] sm:shrink-0 aspect-[16/9] overflow-hidden rounded-[var(--md-sys-shape-corner-large-increased)] bg-md-surface-container ring-1 ring-inset ring-md-outline-variant">
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
