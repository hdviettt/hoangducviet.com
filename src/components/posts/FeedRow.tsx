import type { FeedItem } from "@/lib/posts";
import Link from "next/link";

// Post-index rows, as cards with their cover art, the same shape /work uses.
//
// This replaced a whitespace list, and the reason is that the covers exist and
// were being wasted. Every published post has one -- 18 of 18 -- drawn as a
// 1200x630 SVG in `/covers`, and until now they were only ever sent to Twitter
// and LinkedIn as share images. Nobody reading the site had seen them.
//
// The size they are shown at is not a taste call. These are not title cards:
// the drawing carries its own content, set at 18px on a 1200px canvas. Rendered
// 380px wide, in the kind of grid a card layout wants, that type lands at about
// 6px and the artwork becomes a smudge. Measured, it needs about 820px to read.
//
// That is why the card is stacked rather than split like /work. The feed sits
// in col-2 of the site grid, 763px wide, and splitting it would leave the cover
// 509px -- 7.6px type, which is the smudge. Stacked, the cover gets the whole
// 763 and lands at 11.4px, which reads. It is the same arrangement a work card
// takes when it is one column: picture first, then the panel.
//
// The words below the cover are not in a panel, and there are only two of them:
// a date and a title. /work puts its words in a filled box because a project
// card is a unit with a button in it, something you act on; a post is something
// you read, and a cover plus a title is already a whole item.
//
// No description here. The index is for choosing what to read, and a paragraph
// under every drawing turned the choosing into reading.
//
// Nothing is cropped either. A screenshot has a dull bottom edge that can be
// spent to fill a box; a drawing has four edges that are all the drawing, and
// these covers run their dialogue out to the margins.

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

const DATE_CLS =
  "block text-[0.78125rem] tabular-nums text-md-on-surface-variant";

// Bigger than it was, because it is now the only text an item has. With the
// description gone the title is what a reader scans, and at 1.75rem under a
// 405px drawing it was the smaller half of its own item.
const TITLE_CLS =
  "font-display text-[1.5rem] leading-[1.18] tracking-[-0.018em] " +
  "font-normal text-md-on-surface [text-wrap:balance] sm:text-[1.75rem] " +
  "lg:text-[2rem]";

/** The cover, or nothing. A post with no art gets a panel-only card.
 *
 * Decorative: the title next to it says the same thing, so an alt would be the
 * heading read twice. */
function Cover({ src }: { src: string | null }) {
  if (!src) return null;
  return (
    // A hairline, the same one a screenshot gets on a work card. The drawing
    // sits on its own white ground and the page is white, so without an edge
    // the cover has no boundary at all and the art floats in the column. The
    // ring is what makes it a block.
    <div className="fw-media ring-1 ring-inset ring-md-outline-variant">
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="w-full transition-transform duration-500 ease-md-standard group-hover:scale-[1.015]"
      />
    </div>
  );
}

function PostRow({ item }: { item: Extract<FeedItem, { kind: "post" }> }) {
  const { post } = item;
  const href = `/posts/${post.slug}`;
  const cover = post.thumbnail?.trim() || null;

  return (
    <article className="feed-item group">
      <Cover src={cover} />
      <span className={`${DATE_CLS} mt-5`}>
        {feedRowDate(post.date_created)}
      </span>
      <h3 className={`mt-2 ${TITLE_CLS}`}>
        <Link
          href={href}
          className="rounded-sm transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          {post.title}
        </Link>
      </h3>
    </article>
  );
}

function SeriesRow({ item }: { item: Extract<FeedItem, { kind: "series" }> }) {
  const { parts, series } = item;
  const href = `/collection/${series.slug}`;
  const cover = series.thumbnail?.trim() || null;

  return (
    <div>
      <article className="feed-item group">
        <Cover src={cover} />
        <span className={`${DATE_CLS} mt-5`}>
          {feedRowDate(item.lastDate)}
          {parts.length > 1 && (
            <>
              <span className="mx-1.5 opacity-60">·</span>
              {parts.length} parts
            </>
          )}
        </span>
        <h3 className={`mt-2 ${TITLE_CLS}`}>
          <Link
            href={href}
            className="rounded-sm transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            {series.title}
          </Link>
        </h3>
      </article>

      {/* Indented past the title's left edge, the way they were in the list
          this grew out of: three signals say these belong to the title above
          them -- the indent, the size step down, and a pitch far tighter than
          the space between one feed item and the next. */}
      <div className="feed-parts mt-4 ml-5 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
        {parts.map((part, i) => (
          <Link
            key={part.slug}
            href={`/posts/${part.slug}`}
            className="group/part flex items-baseline gap-3 rounded-sm py-[0.1875rem]"
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
