import type { FeedItem } from "@/lib/posts";
import Link from "next/link";

// Post-index rows, set as a whitespace list rather than a ruled one.
//
// What was here put a 92px date column beside the title and a 1px rule under
// every row. That is a newspaper index, and it is the one shape no Google
// surface uses: probing news.google.com for rows carrying a border returned
// zero, and of every element across blog.google and fonts.google.com that
// gains a hover plate, none carries a rule. Google separates an index on
// whitespace and lets the title carry the row.
//
// So: the date drops to a quiet label above the title, the title comes up to
// 21px at weight 400, and the gap between items does the separating. Hover
// underlines, which is what a search result does.
//
// The cost of losing the date column is that the list no longer has one shared
// left edge to scan down. The gain is that the title is the widest thing on the
// row instead of the second widest, and it is the title people are reading.

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

// 21px at 400, not 19px at 500. Without a date column beside it the title has
// the full measure, so it can be set bigger and lighter and still not shout.
// The tracking follows the size: -0.016em at 21px, where the ruled row's 19px
// took -0.013em.
const TITLE_CLS =
  "block font-display text-[1.3125rem] leading-[1.26] tracking-[-0.016em] " +
  "font-normal text-md-on-surface [text-wrap:balance] " +
  "transition-colors duration-200 ease-md-standard " +
  "group-hover:text-primary group-hover:underline " +
  "group-hover:decoration-1 group-hover:underline-offset-[3px]";

// The date is a label now, not a column. Regular weight rather than medium:
// it sits above the title instead of beside it, so it no longer needs weight
// to hold its own against one.
const DATE_CLS =
  "block mb-1 text-[0.78125rem] tabular-nums text-md-on-surface-variant";

function PostRow({ item }: { item: Extract<FeedItem, { kind: "post" }> }) {
  return (
    <Link
      href={`/posts/${item.post.slug}`}
      className="group block max-w-[40rem] rounded-sm focus-visible:outline-2"
    >
      <span className={DATE_CLS}>{feedRowDate(item.post.date_created)}</span>
      <span className={TITLE_CLS}>{item.post.title}</span>
    </Link>
  );
}

function SeriesRow({ item }: { item: Extract<FeedItem, { kind: "series" }> }) {
  const { parts, series } = item;

  return (
    <div className="max-w-[40rem]">
      <Link
        href={`/collection/${series.slug}`}
        className="group block rounded-sm"
      >
        <span className={DATE_CLS}>
          {feedRowDate(item.lastDate)}
          {parts.length > 1 && (
            <>
              <span className="mx-1.5 opacity-60">·</span>
              {parts.length} parts
            </>
          )}
        </span>
        <span className={TITLE_CLS}>{series.title}</span>
      </Link>

      {/* The one thing a whitespace list has to earn: making nine parts read as
          belonging to the title above them, with no box and no rule to bind
          them.

          Three signals do it, and they compound. The parts are indented past
          the title's left edge, so the group has its own margin. They drop from
          21px to 14.5px, which is the largest size step anywhere in this
          component and reads as subordination on its own. And their pitch is
          28px against the 48px between feed items in FeedBlocks, a ratio of
          1.7, which is where proximity starts carrying weight rather than
          merely not contradicting the other two. The first draft had 34px
          against 40px, a ratio of 1.18, and the comment claimed proximity was
          doing the work when measurement said it was doing none.

          A left thread rule was the obvious fourth signal and is deliberately
          not here: the premise of this treatment is that nothing is drawn which
          is not content, and three signals already settle it. */}
      <div className="mt-2.5 ml-5 grid gap-x-10 sm:grid-cols-2">
        {parts.map((part, i) => (
          <Link
            key={part.slug}
            href={`/posts/${part.slug}`}
            className="group/part flex items-baseline gap-3 py-[0.125rem] rounded-sm"
          >
            <span className="w-5 shrink-0 text-[0.78125rem] tabular-nums text-md-on-surface-variant">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className="text-[0.90625rem] leading-[1.4] text-md-on-surface-variant
                transition-colors duration-200 ease-md-standard
                group-hover/part:text-primary group-hover/part:underline
                group-hover/part:decoration-1 group-hover/part:underline-offset-2"
            >
              {stripPartPrefix(part.title)}
            </span>
          </Link>
        ))}
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
