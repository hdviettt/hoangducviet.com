"use client";

import Link from "next/link";

interface SeriesBlockProps {
  project: {
    slug: string;
    title: string;
    summary: string | null;
  };
  parts: { slug: string; title: string; date_created: string }[];
  firstDate: string;
  lastDate: string;
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
  project,
  parts,
  firstDate,
  lastDate,
}: SeriesBlockProps) {
  return (
    <article className="py-5 md:py-6">
      {/* Meta row — kind, count, date range. The "SERIES · N PARTS" badge
          carries the visual signal that this is a series; no left border
          needed. */}
      <div className="flex items-baseline gap-3 flex-wrap mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary/70">
          Series · {parts.length} parts
        </span>
        <span className="text-xs text-muted-foreground/60 tabular-nums">
          {formatDateRange(firstDate, lastDate)}
        </span>
      </div>

      {/* Title — links to the project page (the canonical series landing).
          The TL;DR lives on the project page; the homepage block is just
          a structural preview. */}
      <Link href={`/projects/${project.slug}`} className="group block mb-4 md:mb-5">
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
          {project.title}
        </h3>
      </Link>

      {/* Parts list — each links to its own post page */}
      <ol className="space-y-2">
        {parts.map((part, i) => (
          <li key={part.slug} className="flex items-baseline gap-3">
            <span className="text-xs tabular-nums font-medium text-muted-foreground/50 w-6 shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <Link
              href={`/posts/${part.slug}`}
              className="text-sm leading-snug text-muted-foreground hover:text-foreground transition-colors"
            >
              {stripPartPrefix(part.title)}
            </Link>
          </li>
        ))}
      </ol>
    </article>
  );
}
