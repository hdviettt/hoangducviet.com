import type { FeedItem } from "@/lib/posts";
import Link from "next/link";

// scale.com/blog list row: DATE (left) · TITLE (large, regular) · CATEGORY
// (right), separated by a single hairline (border-b here). One column on
// mobile (date → title → category), three columns from sm up. No cover, no
// excerpt — the list is the design.

// DD.MM.YYYY — kept for the post-detail and series pages that already use it.
export function feedRowDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  // UTC parts so server and client render the same string (no locale drift).
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getUTCFullYear()}`;
}

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

// "AUG 2026" — the Scale-style month-year stamp shown in the feed.
function monthYear(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export default function FeedRow({
  item,
}: {
  item: FeedItem;
  // Accepted for call-site compatibility; the Scale row shows no view count.
  views?: number;
}) {
  const isSeries = item.kind === "series";
  const href = isSeries
    ? `/series/${item.series.slug}`
    : `/posts/${item.post.slug}`;
  const title = isSeries ? item.series.title : item.post.title;
  const date = monthYear(isSeries ? item.lastDate : item.post.date_created);
  const category = isSeries
    ? "Series"
    : (item.post.categories?.[0]?.title ?? "");

  return (
    <Link
      href={href}
      className="group grid grid-cols-1 sm:grid-cols-[clamp(92px,12vw,150px)_1fr_auto] items-baseline gap-y-1.5 sm:gap-x-6 md:gap-x-12 py-7 md:py-9 border-b border-md-outline-variant"
    >
      <span className="text-[12.5px] font-medium tracking-[0.07em] uppercase text-md-on-surface-variant tabular-nums sm:pt-1.5">
        {date}
      </span>
      <h3 className="text-[20px] leading-[1.2] md:text-[27px] md:leading-[1.16] font-normal tracking-tight text-md-on-surface [text-wrap:balance] transition-colors duration-200 ease-md-standard group-hover:text-primary">
        {title}
      </h3>
      {category && (
        <span className="text-[11.5px] font-medium tracking-[0.07em] uppercase text-md-on-surface-variant whitespace-nowrap sm:justify-self-end sm:text-right sm:pt-2">
          {category}
        </span>
      )}
    </Link>
  );
}
