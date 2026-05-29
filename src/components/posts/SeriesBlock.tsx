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
  parts: { slug: string; title: string; date_created: string }[];
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

export default function SeriesBlock({
  series,
  parts,
  firstDate,
  lastDate,
  viewCount,
}: SeriesBlockProps) {
  return (
    <article className="md:col-span-2 group flex flex-col p-6 md:p-8 rounded-2xl border border-md-outline-variant bg-md-primary-container/30 hover:bg-md-primary-container/50 hover:shadow-md-1 transition-all duration-200 ease-md-standard">
      {/* Meta header — M3 chip + date range */}
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full md-label-small bg-md-primary text-md-on-primary">
          <Icon name="auto_stories" size={14} />
          Series · {parts.length} parts
        </span>
        <span className="md-label-small text-md-on-surface-variant tabular-nums">
          {formatDateRange(firstDate, lastDate)}
        </span>
        {viewCount !== undefined && viewCount > 0 && (
          <span className="md-label-small text-md-on-surface-variant">
            <ViewCount count={viewCount} />
          </span>
        )}
      </div>

      {/* Title */}
      <Link
        href={`/series/${series.slug}`}
        className="block mb-3 md:mb-4 hover:text-primary transition-colors duration-200 ease-md-standard"
      >
        <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-md-on-surface">
          {series.title}
        </h3>
      </Link>

      {series.summary && (
        <p className="mb-5 md:mb-6 md-body-medium text-md-on-surface-variant max-w-2xl">
          {series.summary}
        </p>
      )}

      {/* Parts list */}
      <ol className="space-y-1 mb-2">
        {parts.map((part, i) => (
          <li key={part.slug}>
            <Link
              href={`/posts/${part.slug}`}
              className="flex items-baseline gap-3 px-3 py-2 -mx-3 rounded-lg hover:bg-md-on-surface/8 transition-colors duration-200 ease-md-standard"
            >
              <span className="md-label-small tabular-nums text-md-on-surface-variant/70 w-6 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="md-body-medium text-md-on-surface-variant">
                {stripPartPrefix(part.title)}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <Link
        href={`/series/${series.slug}`}
        className="mt-4 self-start inline-flex items-center gap-1 md-label-medium text-primary hover:underline transition-colors duration-200"
      >
        View series
        <Icon name="arrow_forward" size={16} />
      </Link>
    </article>
  );
}
