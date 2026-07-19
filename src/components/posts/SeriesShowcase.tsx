import Link from "next/link";

import { ViewCount } from "@/components/posts/ViewCount";
import type { FeedItem } from "@/lib/posts";
import { feedRowDate } from "./FeedRow";

type SeriesItem = Extract<FeedItem, { kind: "series" }>;

// Part titles usually repeat the series name ("<Series> #3: Inverted Index");
// inside the showcase the "Part N" meta already carries that context.
function partLabel(title: string, seriesTitle: string): string {
  const stripped = title.replace(
    new RegExp(
      `^${seriesTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*#?\\d*\\s*[:·-]\\s*`,
      "i",
    ),
    "",
  );
  return stripped || title;
}

// A series mirrors the featured-post anatomy: a sticky rail with the series'
// identity (cover, title, summary) on the left, and the parts on the right as
// rows identical to a regular FeedRow — same type size, same meta, same cover.
export default function SeriesShowcase({
  item,
  viewCounts,
  className = "",
}: {
  item: SeriesItem;
  viewCounts: Record<string, number>;
  className?: string;
}) {
  const { series, parts } = item;
  const views = parts.reduce((sum, p) => sum + (viewCounts[p.slug] ?? 0), 0);

  return (
    <section className={className}>
      {/* Same 2-col geometry as the regular feed grid (50/50, same gaps) so
          the parts column's left edge lines up with the right column of the
          post rows above and below — deepmind.google uses one grid for both. */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-16 xl:gap-x-20 items-start">
        {/* Sticky rail — the series' general identity. On mobile the cover
            moves above the text (order-first) so it reads image→text like
            every other card, instead of stacking against part 1's cover. */}
        <div className="mb-10 lg:mb-0 lg:sticky lg:top-10 lg:self-start flex flex-col">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] leading-5 text-md-on-surface-variant">
            <span className="font-medium text-primary">Series</span>
            <span>{parts.length} parts</span>
            <span className="tabular-nums">{feedRowDate(item.lastDate)}</span>
            {views > 0 && <ViewCount count={views} />}
          </div>
          <Link href={`/series/${series.slug}`} className="group block mt-3">
            <h3 className="text-[28px] leading-9 md:text-[42px] md:leading-[48px] font-medium tracking-tight text-md-on-surface group-hover:text-primary transition-colors duration-200 ease-md-standard">
              {series.title}
            </h3>
          </Link>
          {series.summary && (
            <p className="mt-4 text-[16px] leading-[26px] text-md-on-surface-variant max-w-[560px]">
              {series.summary}
            </p>
          )}
          <Link
            href={`/series/${series.slug}`}
            className="group block order-first mb-6 lg:order-none lg:mb-0 lg:mt-6"
          >
            <div className="overflow-hidden rounded-[var(--md-sys-shape-corner-large-increased)] bg-md-surface-container ring-1 ring-inset ring-md-outline-variant">
              {/* biome-ignore lint/a11y/useAltText: decorative cover, title is adjacent */}
              <img
                src={`/covers/series-${series.slug}.svg`}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-auto transition-transform duration-300 ease-md-standard group-hover:scale-[1.02]"
              />
            </div>
          </Link>
        </div>

        {/* Parts — the exact FeedRow anatomy, so rail posts read as first-class
            cards: same title scale, same description, same meta line, same
            cover size, and the same one-hairline-per-card rule as the feed. */}
        <div className="[&>a]:border-b [&>a]:border-md-outline-variant lg:[&>a:first-child]:pt-0">
          {parts.map((part, i) => (
            <Link
              key={part.slug}
              href={`/posts/${part.slug}`}
              className="group flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-8 py-8 md:py-10"
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-[22px] leading-7 md:text-[28px] md:leading-9 font-medium tracking-tight text-md-on-surface group-hover:text-primary transition-colors duration-200 ease-md-standard">
                  {partLabel(part.title, series.title)}
                </h4>
                {part.description && (
                  <p className="mt-3 text-[16px] leading-[26px] text-md-on-surface-variant">
                    {part.description}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] leading-5 text-md-on-surface-variant">
                  <span className="tabular-nums">Part {i + 1}</span>
                  <span className="tabular-nums">
                    {feedRowDate(part.date_created)}
                  </span>
                  {(viewCounts[part.slug] ?? 0) > 0 && (
                    <ViewCount count={viewCounts[part.slug] ?? 0} />
                  )}
                </div>
              </div>
              <div className="order-first sm:order-none w-full sm:w-[180px] md:w-[240px] lg:w-[180px] xl:w-[240px] sm:shrink-0 aspect-[3/2] sm:aspect-square overflow-hidden rounded-[var(--md-sys-shape-corner-large-increased)] bg-md-surface-container ring-1 ring-inset ring-md-outline-variant">
                {/* biome-ignore lint/a11y/useAltText: decorative thumbnail, title is adjacent */}
                <img
                  src={`/covers/${part.slug}.svg`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-300 ease-md-standard group-hover:scale-[1.03]"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
