import type { FeedItem } from "@/lib/posts";
import Link from "next/link";

/**
 * IDEA 2 — the collection gets a front door.
 *
 * Half the writing on this site is one object: nine of eighteen published
 * posts are "Building a mini search engine". It lives at /collection/<slug>,
 * has no nav entry and no index, and its only way in is a row in a feed sorted
 * by date — where, the moment that feed is trimmed to the newest six, it
 * disappears from the homepage entirely. Measured: collections went from 1 to
 * 0 the instant the feed was cut.
 *
 * A nine-part series is closer to a project than to a post, so it is built
 * like one: a title, what it is, and the parts listed as the sequence they
 * are, rather than nine rows scattered through a chronological list.
 */
export default function CollectionLead({ item }: { item: FeedItem | null }) {
  if (!item || item.kind !== "series") return null;
  const { series, parts } = item;

  return (
    <section className="work-breakout">
      <div className="site-grid items-baseline">
        <h2 className="col-1 text-[1.4375rem] font-medium tracking-[-0.02em] text-md-on-surface">
          Collections
        </h2>
        <p className="col-2 text-[0.9375rem] leading-7 text-md-on-surface-variant">
          Writing that runs long enough to need an order.
        </p>
      </div>

      <div className="site-grid mt-9 md:mt-12">
        <div className="col-1">
          <p className="text-[0.9375rem] leading-6 text-md-on-surface-variant">
            {parts.length} parts
          </p>
          <h3 className="mt-3 max-w-[17ch] text-balance text-[1.4375rem] font-normal leading-[1.22] tracking-[-0.25px] text-md-on-surface sm:text-[1.75rem] lg:text-[2rem]">
            <Link
              href={`/collection/${series.slug}`}
              className="rounded-sm transition-colors hover:text-primary"
            >
              {series.title}
            </Link>
          </h3>
          {series.summary && (
            <p className="mt-5 text-[0.9375rem] leading-7 text-md-on-surface-variant">
              {series.summary}
            </p>
          )}
          <Link
            href={`/collection/${series.slug}`}
            className="md-btn md-btn-outlined md-btn-pill md-btn-lg mt-8 no-underline"
          >
            Read the series
          </Link>
        </div>

        {/* The parts, numbered. A sequence is the one thing a feed cannot show
            about this, and it is the whole reason the object exists. */}
        <ol className="col-2 border-t border-md-outline-variant">
          {parts.map((p, i) => (
            <li key={p.slug}>
              <Link
                href={`/posts/${p.slug}`}
                className="group grid grid-cols-[2.25rem_1fr] items-baseline gap-x-3 border-b border-md-outline-variant py-3"
              >
                <span className="text-[0.8125rem] tabular-nums text-md-on-surface-variant">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[0.9375rem] leading-6 text-md-on-surface transition-colors group-hover:text-primary">
                  {p.title}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
