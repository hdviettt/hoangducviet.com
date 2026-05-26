"use client";

import { ViewCount } from "@/components/posts/ViewCount";
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

// "Mar 16 – Mar 28, 26" / "Mar 16, 25 – Mar 28, 26" — same logic as the
// homepage's formatDateRange. Kept inline so this component is self-contained.
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
      year: "2-digit",
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
      year: "2-digit",
    });
    return `${start} – ${end}`;
  }
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "2-digit",
  };
  return `${first.toLocaleDateString("en-US", opts)} – ${last.toLocaleDateString("en-US", opts)}`;
}

// Title in DB is "Building a Mini Search Engine #N: Topic" — strip the
// "Series Name #N:" prefix so the parts list reads cleanly.
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
    <article className="py-5 md:py-6">
      {/* Meta row — kind, count, date range. The "SERIES · N PARTS" badge
          carries the visual signal that this is a series; no left border
          needed. */}
      <div className="flex items-center gap-3 flex-wrap mb-3">
        <span className="md-label-medium uppercase tracking-widest text-md-primary">
          Series · {parts.length} parts
        </span>
        <span className="md-label-small text-md-on-surface-variant tabular-nums">
          {formatDateRange(firstDate, lastDate)}
        </span>
        {viewCount !== undefined && (
          <span className="md-label-small text-md-on-surface-variant">
            <ViewCount count={viewCount} />
          </span>
        )}
      </div>

      {/* Title — links to the series landing page */}
      <Link href={`/series/${series.slug}`} className="group block mb-3 md:mb-4">
        <h3 className="text-xl md:text-2xl font-medium tracking-tight text-md-on-surface group-hover:text-primary transition-colors duration-200 ease-md-standard">
          {series.title}
        </h3>
      </Link>

      {series.summary && (
        <p className="mt-2 mb-5 md:mb-6 md-body-medium text-md-on-surface-variant max-w-2xl">
          {series.summary}
        </p>
      )}

      {/* Parts list */}
      <ol className="space-y-2">
        {parts.map((part, i) => (
          <li key={part.slug} className="flex items-baseline gap-3">
            <span className="md-label-small tabular-nums text-md-on-surface-variant/70 w-6 shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <Link
              href={`/series/${series.slug}/${part.slug}`}
              className="md-body-medium text-md-on-surface-variant hover:text-md-on-surface transition-colors duration-200 ease-md-standard"
            >
              {stripPartPrefix(part.title)}
            </Link>
          </li>
        ))}
      </ol>
    </article>
  );
}
