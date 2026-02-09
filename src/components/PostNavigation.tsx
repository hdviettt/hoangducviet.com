import Link from "next/link";

interface PostNavigationProps {
  previous: { slug?: string; title?: string } | null;
  next: { slug?: string; title?: string } | null;
}

export default function PostNavigation({ previous, next }: PostNavigationProps) {
  if (!previous && !next) return null;

  return (
    <nav className="mt-16 pt-8 border-t border-border">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {previous ? (
          <Link
            href={`/posts/${previous.slug}`}
            className="group p-4 border border-border hover:border-primary transition-colors"
          >
            <span className="text-xs text-muted-foreground block mb-1">
              ← Previous
            </span>
            <span className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {previous.title}
            </span>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}
        {next ? (
          <Link
            href={`/posts/${next.slug}`}
            className="group p-4 border border-border hover:border-primary transition-colors sm:text-right"
          >
            <span className="text-xs text-muted-foreground block mb-1">
              Next →
            </span>
            <span className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {next.title}
            </span>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}
      </div>
    </nav>
  );
}
