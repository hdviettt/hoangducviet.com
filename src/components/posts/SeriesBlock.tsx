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

// Google "collection" card: collection meta on the left, a compact list of
// part rows on the right. Each row shows a small thumbnail when the post has
// one, otherwise a numbered chip — so text-only series stay tidy, not cramped.
export default function SeriesBlock({
  series,
  parts,
  firstDate,
  lastDate,
  viewCount,
}: SeriesBlockProps) {
  const preview = parts.slice(0, 5);
  const remaining = parts.length - preview.length;

  return (
    <article className="md:col-span-2 rounded-2xl border border-md-outline-variant bg-md-primary-container/30 p-6 md:p-8 transition-all duration-200 ease-md-standard hover:bg-md-primary-container/50 hover:shadow-md-1">
      <div className="grid gap-6 md:gap-10 md:grid-cols-[minmax(0,300px)_1fr] md:items-start">
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
            <p className="mb-5 md-body-medium text-md-on-surface-variant line-clamp-5">
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

        {/* Right — compact part rows */}
        <div className="flex flex-col gap-2.5">
          {preview.map((part, i) => (
            <Link
              key={part.slug}
              href={`/posts/${part.slug}`}
              className="group/card flex items-center gap-3 rounded-xl border border-md-outline-variant bg-md-surface p-2.5 hover:bg-md-surface-container-low hover:shadow-md-1 transition-all duration-200 ease-md-standard"
            >
              <div className="w-11 h-11 rounded-lg bg-md-primary-container/40 flex items-center justify-center shrink-0">
                <span className="md-label-large tabular-nums text-md-on-primary-container/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h4 className="min-w-0 flex-1 md-body-medium font-medium text-md-on-surface line-clamp-2 group-hover/card:text-primary transition-colors duration-200">
                {stripPartPrefix(part.title)}
              </h4>
              <Icon
                name="arrow_forward"
                size={16}
                className="shrink-0 text-md-on-surface-variant/40 group-hover/card:text-primary transition-colors duration-200"
              />
            </Link>
          ))}

          {remaining > 0 && (
            <Link
              href={`/series/${series.slug}`}
              className="self-start mt-1 md-label-small text-primary hover:underline"
            >
              +{remaining} more part{remaining > 1 ? "s" : ""}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
