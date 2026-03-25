import Link from "next/link";

interface PostNavigationProps {
  previous: { slug?: string; title?: string } | null;
  next: { slug?: string; title?: string } | null;
}

export default function PostNavigation({
  previous,
  next,
}: PostNavigationProps) {
  if (!previous && !next) return null;

  return (
    <nav
      className="mt-16 pt-8 border-t"
      style={{ borderColor: "var(--article-border)" }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {previous ? (
          <Link
            href={`/posts/${previous.slug}`}
            className="group p-4 rounded-lg border transition-colors"
            style={{ borderColor: "var(--article-border)" }}
          >
            <span
              className="text-xs block mb-1"
              style={{ color: "var(--article-text)" }}
            >
              ← Previous
            </span>
            <span
              className="text-sm transition-colors line-clamp-2"
              style={{ color: "var(--article-heading)" }}
            >
              {previous.title}
            </span>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}
        {next ? (
          <Link
            href={`/posts/${next.slug}`}
            className="group p-4 rounded-lg border transition-colors sm:text-right"
            style={{ borderColor: "var(--article-border)" }}
          >
            <span
              className="text-xs block mb-1"
              style={{ color: "var(--article-text)" }}
            >
              Next →
            </span>
            <span
              className="text-sm transition-colors line-clamp-2"
              style={{ color: "var(--article-heading)" }}
            >
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
