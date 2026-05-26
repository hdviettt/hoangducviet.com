import { Icon } from "@/components/ui/Icon";
import Link from "next/link";

interface NavItem {
  slug?: string;
  title?: string;
  href?: string | null;
}

interface PostNavigationProps {
  previous: NavItem | null;
  next: NavItem | null;
  context?: { kind: "series"; title: string };
}

export default function PostNavigation({
  previous,
  next,
  context,
}: PostNavigationProps) {
  if (!previous && !next) return null;

  const prevLabel =
    context?.kind === "series" ? "Previous in series" : "Previous";
  const nextLabel =
    context?.kind === "series" ? "Next in series" : "Next";

  const prevHref = previous?.href || (previous?.slug ? `/posts/${previous.slug}` : null);
  const nextHref = next?.href || (next?.slug ? `/posts/${next.slug}` : null);

  return (
    <nav className="mt-16 pt-8 border-t border-md-outline-variant">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {previous && prevHref ? (
          <Link
            href={prevHref}
            className="group p-5 rounded-xl border border-md-outline-variant bg-md-surface-container-low hover:bg-md-surface-container transition-colors duration-200 ease-md-standard"
          >
            <span className="md-label-medium text-md-on-surface-variant flex items-center gap-1 mb-1.5">
              <Icon name="arrow_back" size={16} />
              {prevLabel}
            </span>
            <span className="md-title-medium text-md-on-surface line-clamp-2">
              {previous.title}
            </span>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}
        {next && nextHref ? (
          <Link
            href={nextHref}
            className="group p-5 rounded-xl border border-md-outline-variant bg-md-surface-container-low hover:bg-md-surface-container transition-colors duration-200 ease-md-standard sm:text-right"
          >
            <span className="md-label-medium text-md-on-surface-variant flex items-center justify-end gap-1 mb-1.5">
              {nextLabel}
              <Icon name="arrow_forward" size={16} />
            </span>
            <span className="md-title-medium text-md-on-surface line-clamp-2">
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
