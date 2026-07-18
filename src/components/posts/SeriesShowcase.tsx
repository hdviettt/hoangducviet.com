import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { ViewCount } from "@/components/posts/ViewCount";
import type { FeedItem } from "@/lib/posts";
import { feedRowDate } from "./FeedRow";

type SeriesItem = Extract<FeedItem, { kind: "series" }>;

// Part titles usually repeat the series name ("<Series> #3: Inverted Index");
// inside the showcase the numbered index already carries that context.
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
// identity (cover, title, summary) on the left, and the parts as full rows
// with their own cover thumbnails on the right.
export default function SeriesShowcase({
  item,
  views,
}: {
  item: SeriesItem;
  views: number;
}) {
  const { series, parts } = item;

  return (
    <section className="mt-16 md:mt-24">
      <div className="lg:grid lg:grid-cols-[7fr_6fr] lg:gap-16 xl:gap-20 items-start">
        {/* Sticky rail — the series' general identity */}
        <div className="mb-12 lg:mb-0 lg:sticky lg:top-10 lg:self-start">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] leading-5 text-md-on-surface-variant">
            <span className="font-medium text-primary">Series</span>
            <span>{parts.length} parts</span>
            <span className="tabular-nums">{feedRowDate(item.lastDate)}</span>
            {views > 0 && <ViewCount count={views} />}
          </div>
          <Link href={`/series/${series.slug}`} className="group block mt-3">
            <h3 className="text-[28px] leading-9 md:text-[42px] md:leading-[48px] font-normal tracking-tight text-md-on-surface group-hover:text-primary transition-colors duration-200 ease-md-standard">
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
            className="group mt-5 inline-flex items-center gap-1.5 text-[14px] leading-5 font-medium text-md-on-surface hover:text-primary transition-colors duration-200 ease-md-standard"
          >
            View series
            <Icon
              name="arrow_forward"
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
          <Link
            href={`/series/${series.slug}`}
            className="group mt-7 hidden lg:block"
          >
            <div className="overflow-hidden rounded-[var(--md-sys-shape-corner-large-increased)] bg-md-surface-container">
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

        {/* Parts — full rows with their own covers, hairline separated */}
        <div className="divide-y divide-md-outline-variant border-t border-b border-md-outline-variant lg:[&>a:first-child]:pt-0 lg:border-t-0">
          {parts.map((part, i) => (
            <Link
              key={part.slug}
              href={`/posts/${part.slug}`}
              className="group flex items-center gap-6 py-6"
            >
              <span className="text-[13px] leading-5 tabular-nums text-md-on-surface-variant shrink-0 w-7">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="text-[19px] leading-7 md:text-[22px] md:leading-8 font-normal tracking-tight text-md-on-surface group-hover:text-primary transition-colors duration-200 ease-md-standard">
                  {partLabel(part.title, series.title)}
                </h4>
              </div>
              <div className="hidden sm:block shrink-0 w-[104px] aspect-square overflow-hidden rounded-2xl bg-md-surface-container">
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
