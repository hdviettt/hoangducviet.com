import Link from "next/link";
import type { ReactNode } from "react";

// The admin list row IS the reader's feed row: same 22/28px medium title with
// tight tracking, same description, same meta line, same square thumbnail on
// the right behind an inset hairline. Editing affordances live in a strip that
// only appears on hover, so at rest the CMS looks like the site it publishes.
//
// Deliberately not a table: no header row, no cell borders, no panel around
// the list. A hairline under each row is the whole separator vocabulary the
// reader-facing side owns, and it is enough here too.

export function adminDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminRow({
  href,
  title,
  description,
  thumbnail,
  meta,
  actions,
  muted,
}: {
  href: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  meta?: ReactNode;
  actions?: ReactNode;
  /** Drafts sit back a step so the published set reads first. */
  muted?: boolean;
}) {
  return (
    <div className="group relative flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-8 py-6 md:py-8 border-b border-md-outline-variant">
      <div className="min-w-0 flex-1">
        <Link href={href} className="block">
          <h3
            className={`text-[22px] leading-7 md:text-[26px] md:leading-8 font-medium tracking-tight transition-colors duration-200 ease-md-standard group-hover:text-md-primary ${
              muted ? "text-md-on-surface-variant" : "text-md-on-surface"
            }`}
          >
            {title}
          </h3>
          {description && (
            <p className="mt-2 text-[15px] leading-6 text-md-on-surface-variant line-clamp-2">
              {description}
            </p>
          )}
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] leading-5 text-md-on-surface-variant">
          {meta}
        </div>
      </div>

      {thumbnail ? (
        <Link
          href={href}
          className="order-first sm:order-none w-full sm:w-[120px] md:w-[140px] sm:shrink-0 aspect-[3/2] sm:aspect-square overflow-hidden rounded-[var(--md-sys-shape-corner-large)] bg-md-surface-container ring-1 ring-inset ring-md-outline-variant"
        >
          {/* biome-ignore lint/a11y/useAltText: decorative, the title sits beside it */}
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-300 ease-md-standard group-hover:scale-[1.03]"
          />
        </Link>
      ) : (
        <div className="hidden sm:block sm:w-[120px] md:w-[140px] sm:shrink-0" />
      )}

      {actions && (
        <div className="absolute right-0 top-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 ease-md-standard">
          {actions}
        </div>
      )}
    </div>
  );
}
