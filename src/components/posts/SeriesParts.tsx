import Link from "next/link";

interface SeriesPartsProps {
  series: { slug: string; title: string };
  parts: Array<{ slug: string; title: string }>;
  currentSlug: string;
}

// Compact "All parts" list rendered inside the post-page sidebar (alongside or
// below the table of contents). Highlights the current part.
export default function SeriesParts({
  series,
  parts,
  currentSlug,
}: SeriesPartsProps) {
  return (
    <nav aria-label="All parts in this series" className="mt-10">
      <Link
        href={`/series/${series.slug}`}
        className="block text-xs font-semibold uppercase tracking-wider text-primary/70 hover:text-primary transition-colors mb-3"
      >
        All parts
      </Link>
      <ol className="space-y-2">
        {parts.map((part, i) => {
          const isCurrent = part.slug === currentSlug;
          return (
            <li key={part.slug} className="flex items-baseline gap-2.5">
              <span
                className={`text-xs tabular-nums font-medium shrink-0 ${
                  isCurrent ? "text-primary" : "text-muted-foreground/60"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {isCurrent ? (
                <span className="text-[13px] leading-snug font-medium text-foreground">
                  {stripPartPrefix(part.title)}
                </span>
              ) : (
                <Link
                  href={`/series/${series.slug}/${part.slug}`}
                  className="text-[13px] leading-snug text-muted-foreground hover:text-foreground transition-colors"
                >
                  {stripPartPrefix(part.title)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Title in DB is "Building a Mini Search Engine #N: Topic" — strip everything
// up to and including the colon so the parts list reads cleanly.
function stripPartPrefix(title: string): string {
  const m = title.match(/#\d+:\s*(.+)$/);
  return m ? m[1] : title;
}
