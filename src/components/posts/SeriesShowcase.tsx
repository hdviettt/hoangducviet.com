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

// A series is a body of work, not a feed row — it gets its own full-width
// stage: cover art on the left, title + summary + a numbered parts index on
// the right (deepmind.google collection treatment).
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
      <div className="lg:grid lg:grid-cols-[5fr_7fr] lg:gap-16 xl:gap-20 items-center">
        <Link
          href={`/series/${series.slug}`}
          className="group block mb-10 lg:mb-0"
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

        <div>
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

          <ol className="mt-7 grid sm:grid-cols-2 gap-x-10">
            {parts.map((part, i) => (
              <li key={part.slug}>
                <Link
                  href={`/posts/${part.slug}`}
                  className="group flex items-baseline gap-3 py-2.5 border-t border-md-outline-variant"
                >
                  <span className="text-[13px] leading-5 tabular-nums text-md-on-surface-variant shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[15px] leading-6 text-md-on-surface group-hover:text-primary transition-colors duration-200 ease-md-standard">
                    {partLabel(part.title, series.title)}
                  </span>
                  <Icon
                    name="arrow_forward"
                    size={14}
                    className="ml-auto shrink-0 self-center text-md-on-surface-variant opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                  />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
