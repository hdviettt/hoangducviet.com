import Link from "next/link";

interface SeriesPartsProps {
  project: { slug: string; title: string };
  parts: Array<{ slug: string; title: string }>;
  currentSlug: string;
}

// Compact "All parts" list rendered inside the post-page sidebar (alongside or
// below the table of contents). Highlights the current part.
export default function SeriesParts({
  project,
  parts,
  currentSlug,
}: SeriesPartsProps) {
  return (
    <nav aria-label="All parts in this series" className="mt-8">
      <Link
        href={`/projects/${project.slug}`}
        className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-3"
      >
        All parts
      </Link>
      <ol className="space-y-1.5">
        {parts.map((part, i) => {
          const isCurrent = part.slug === currentSlug;
          return (
            <li key={part.slug} className="flex items-baseline gap-2">
              <span
                className={`font-mono text-xs tabular-nums shrink-0 ${
                  isCurrent ? "text-primary" : "text-muted-foreground/50"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {isCurrent ? (
                <span className="text-xs leading-snug text-foreground">
                  {stripPartPrefix(part.title)}
                </span>
              ) : (
                <Link
                  href={`/posts/${part.slug}`}
                  className="text-xs leading-snug text-muted-foreground hover:text-foreground transition-colors"
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
