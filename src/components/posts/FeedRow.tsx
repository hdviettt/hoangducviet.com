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
// Unlike /work, nothing here is cropped. A screenshot has a dull bottom edge
// that can be spent; a drawing has four edges that are all the drawing. The
// panel is short enough to fit inside the cover's height instead -- no button,
// a clamped description -- so the cover sizes the row and the panel stretches,
// which is invisible because it is a filled box.

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

const TITLE_CLS =
  "font-display text-[1.375rem] leading-[1.2] tracking-[-0.016em] " +
  "font-normal text-md-on-surface [text-wrap:balance] sm:text-[1.625rem] " +
  "lg:text-[1.75rem]";

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
    <article className="fw-card feed-card group">
      <Cover src={cover} />
      <div className="fw-panel">
        <div className="fw-title">
          <span className={DATE_CLS}>{feedRowDate(post.date_created)}</span>
          <h3 className={`mt-2 ${TITLE_CLS}`}>
            <Link
              href={href}
              className="rounded-sm transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              {post.title}
            </Link>
          </h3>
        </div>

        {post.description && (
          <div className="fw-body">
            <p className="mt-4 text-[0.9375rem] leading-7 text-md-on-surface-variant">
              {post.description}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

function SeriesRow({ item }: { item: Extract<FeedItem, { kind: "series" }> }) {
  const { parts, series } = item;
  const href = `/collection/${series.slug}`;
  const cover = series.thumbnail?.trim() || null;

  return (
    <div>
      <article className="fw-card feed-card group">
        <Cover src={cover} />
        <div className="fw-panel">
          <div className="fw-title">
            <span className={DATE_CLS}>
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
          </div>

          {series.summary && (
            <div className="fw-body">
              <p className="mt-4 text-[0.9375rem] leading-7 text-md-on-surface-variant">
                {series.summary}
              </p>
            </div>
          )}
        </div>
      </article>

      {/* The parts sit under the whole card rather than inside the panel.
          Nine of them are 140px of list, which would push the panel past the
          cover's height and start the card cropping art to fit. Below it they
          get the full row and read as what they are: the contents of the thing
          above them. */}
      <div className="feed-parts mt-5 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
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
