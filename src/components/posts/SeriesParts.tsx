import Link from "next/link";

interface SeriesPartsProps {
  series: { slug: string; title: string };
  parts: Array<{ slug: string; title: string }>;
  currentSlug: string;
}

export default function SeriesParts({
  series,
  parts,
  currentSlug,
}: SeriesPartsProps) {
  return (
    <nav aria-label="All parts in this series" className="mt-10">
      <Link
        href={`/series/${series.slug}`}
        className="block md-label-large uppercase tracking-widest text-md-on-surface-variant hover:text-primary transition-colors duration-200 ease-md-standard mb-4"
      >
        All parts
      </Link>
      <ol className="space-y-1">
        {parts.map((part, i) => {
          const isCurrent = part.slug === currentSlug;
          const num = String(i + 1).padStart(2, "0");
          if (isCurrent) {
            return (
              <li
                key={part.slug}
                className="flex items-baseline gap-3 px-3 py-2 rounded-full bg-md-secondary-container text-md-on-secondary-container"
              >
                <span className="md-label-medium tabular-nums shrink-0">
                  {num}
                </span>
                <span className="md-body-medium font-medium">
                  {stripPartPrefix(part.title)}
                </span>
              </li>
            );
          }
          return (
            <li key={part.slug}>
              <Link
                href={`/posts/${part.slug}`}
                className="flex items-baseline gap-3 px-3 py-2 rounded-full text-md-on-surface-variant hover:bg-md-on-surface/8 transition-colors duration-200 ease-md-standard"
              >
                <span className="md-label-medium tabular-nums shrink-0">
                  {num}
                </span>
                <span className="md-body-medium">
                  {stripPartPrefix(part.title)}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function stripPartPrefix(title: string): string {
  const m = title.match(/#\d+:\s*(.+)$/);
  return m ? m[1] : title;
}
