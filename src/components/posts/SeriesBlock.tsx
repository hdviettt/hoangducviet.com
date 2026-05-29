"use client";

import { ViewCount } from "@/components/posts/ViewCount";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";

interface SeriesBlockProps {
  series: {
    slug: string;
    title: string;
    summary: string | null;
  };
  parts: {
    slug: string;
    title: string;
    date_created: string;
    thumbnail: string | null;
  }[];
  firstDate: string;
  lastDate: string;
  viewCount?: number;
}

function formatDateRange(firstIso: string, lastIso: string): string {
  const first = new Date(firstIso);
  const last = new Date(lastIso);
  const sameDay =
    first.getFullYear() === last.getFullYear() &&
    first.getMonth() === last.getMonth() &&
    first.getDate() === last.getDate();
  if (sameDay) {
    return last.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  const sameYear = first.getFullYear() === last.getFullYear();
  if (sameYear) {
    const start = first.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const end = last.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${start} – ${end}`;
  }
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return `${first.toLocaleDateString("en-US", opts)} – ${last.toLocaleDateString("en-US", opts)}`;
}

function stripPartPrefix(title: string): string {
  const m = title.match(/#\d+:\s*(.+)$/);
  return m ? m[1] : title;
}

// Google "collection" card: collection meta on the left, a row of article
// preview cards on the right. Preview cards show a thumbnail when the post has
// one, otherwise a uniform numbered tile so the row stays smooth.
export default function SeriesBlock({
  series,
  parts,
  firstDate,
  lastDate,
  viewCount,
}: SeriesBlockProps) {
  const preview = parts.slice(0, 3);
  const remaining = parts.length - preview.length;

  return (
    <article className="md:col-span-2 rounded-2xl border border-md-outline-variant bg-md-primary-container/30 p-6 md:p-8 transition-all duration-200 ease-md-standard hover:bg-md-primary-container/50 hover:shadow-md-1">
      <div className="grid gap-6 md:gap-10 md:grid-cols-[minmax(0,300px)_1fr] md:items-stretch">
        {/* Left — collection meta */}
        <div className="flex flex-col">
          <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-0.5 rounded-full md-label-small bg-md-primary text-md-on-primary mb-4">
            <Icon name="auto_stories" size={14} />
            Series · {parts.length} parts
          </span>

          <Link
            href={`/series/${series.slug}`}
            className="block mb-3 hover:text-primary transition-colors duration-200 ease-md-standard"
          >
            <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-md-on-surface">
              {series.title}
            </h3>
          </Link>

          {series.summary && (
            <p className="mb-5 md-body-medium text-md-on-surface-variant">
              {series.summary}
            </p>
          )}

          <div className="flex items-center gap-3 flex-wrap mb-6 md-label-small tabular-nums text-md-on-surface-variant">
            <span>{formatDateRange(firstDate, lastDate)}</span>
            {viewCount !== undefined && viewCount > 0 && (
              <ViewCount count={viewCount} />
            )}
          </div>

          <Link
            href={`/series/${series.slug}`}
            className="mt-auto self-start inline-flex items-center gap-1 md-label-medium text-primary hover:underline transition-colors duration-200"
          >
            View series
            <Icon name="arrow_forward" size={16} />
          </Link>
        </div>

        {/* Right — part preview cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {preview.map((part, i) => (
            <Link
              key={part.slug}
              href={`/posts/${part.slug}`}
              className="group/card flex flex-col rounded-xl border border-md-outline-variant bg-md-surface overflow-hidden hover:shadow-md-1 transition-all duration-200 ease-md-standard"
            >
              {part.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={part.thumbnail}
                  alt={stripPartPrefix(part.title)}
                  className="w-full aspect-[16/10] object-cover"
                />
              ) : (
                <div className="w-full aspect-[16/10] bg-md-primary-container/50 flex items-center justify-center">
                  <span className="md-headline-small tabular-nums text-md-on-primary-container/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              )}
              <div className="flex flex-col flex-1 p-3">
                <span className="md-label-small tabular-nums text-md-on-surface-variant/70">
                  Part {String(i + 1).padStart(2, "0")}
                </span>
                <h4 className="mt-1 md-body-medium font-medium text-md-on-surface line-clamp-2 group-hover/card:text-primary transition-colors duration-200">
                  {stripPartPrefix(part.title)}
                </h4>
                {i === preview.length - 1 && remaining > 0 && (
                  <span className="mt-2 md-label-small text-primary">
                    +{remaining} more
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
