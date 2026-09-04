import type { FeedItem } from "@/lib/posts";
import Link from "next/link";

// Post-index rows: a standalone post is a uniform hairline row — a sentence-case
// date, a medium-weight title, and a hover arrow. A multi-post series stays in
// the flow (no box): its title carries an "N-part series" chip and its parts are
// listed beneath in a numbered two-column index. No covers, no category labels,
// no excerpts on plain rows — type and rhythm carry it.

// DD.MM.YYYY — kept for the post-detail and series pages that already use it.
export function feedRowDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  // UTC parts so the server and client render the same string (no locale drift).
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getUTCFullYear()}`;
}

// Part titles usually repeat the series ("… #3: The inverted index"); strip the
// prefix so the part reads as its own clean topic in the index.
function stripPartPrefix(title: string): string {
  return (title || "").replace(/^.*?#\d+:\s*/, "");
}

const TITLE_CLS =
  "text-[21px] leading-[1.25] tracking-[-0.013em] font-medium text-md-on-surface [text-wrap:balance] transition-colors duration-200 ease-md-standard";
const DATE_CLS =
  "text-[13px] font-medium tabular-nums text-md-on-surface-variant";
const ROW_CLS =
  "grid grid-cols-1 gap-y-1.5 border-b border-md-outline-variant sm:gap-x-6";

function PostRow({ item }: { item: Extract<FeedItem, { kind: "post" }> }) {
  return (
    <Link
      href={`/posts/${item.post.slug}`}
      className={`group items-baseline py-[21px] sm:grid-cols-[92px_1fr] ${ROW_CLS}`}
    >
      <span className={`${DATE_CLS} sm:pt-[3px]`}>
        {feedRowDate(item.post.date_created)}
      </span>
      <h3 className={`${TITLE_CLS} group-hover:text-primary`}>
        {item.post.title}
      </h3>
    </Link>
  );
}

function SeriesRow({ item }: { item: Extract<FeedItem, { kind: "series" }> }) {
  const { parts, series } = item;
  const half = Math.ceil(parts.length / 2);
  const columns = [
    { list: parts.slice(0, half), offset: 0 },
    { list: parts.slice(half), offset: half },
  ];

  return (
    <div className={`py-[26px] sm:grid-cols-[92px_1fr] ${ROW_CLS}`}>
      <span className={`${DATE_CLS} sm:pt-[3px]`}>
        {feedRowDate(item.lastDate)}
      </span>
      <div>
        <Link
          href={`/collection/${series.slug}`}
          className={`${TITLE_CLS} hover:text-primary`}
        >
          {series.title}
        </Link>
        <div className="mt-3.5 grid gap-x-10 sm:grid-cols-2">
          {columns.map((col, ci) => (
            <div key={ci === 0 ? "left" : "right"}>
              {col.list.map((part, i) => (
                <Link
                  key={part.slug}
                  href={`/posts/${part.slug}`}
                  className="group/part flex items-baseline gap-3 py-[7px]"
                >
                  <span className="w-5 shrink-0 text-[12.5px] font-medium tabular-nums text-[hsl(var(--md-sys-color-primary)/0.75)]">
                    {String(col.offset + i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[15px] leading-[1.35] text-md-on-surface-variant transition-colors duration-200 ease-md-standard group-hover/part:text-primary">
                    {stripPartPrefix(part.title)}
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FeedRow({
  item,
}: {
  item: FeedItem;
  // Accepted for call-site compatibility; the row shows no view count.
  views?: number;
}) {
  return item.kind === "series" ? (
    <SeriesRow item={item} />
  ) : (
    <PostRow item={item} />
  );
}
