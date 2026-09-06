import Link from "next/link";

// A compact row for a platform piece, used on a parent project's deep-dive
// ("Pieces on the platform"). No status labels: the portfolio reads as one
// body of work, not a build tracker.

export interface ChildRowData {
  slug: string;
  title: string;
  description: string | null;
  buildStatus: string;
}

export function ChildRow({ child }: { child: ChildRowData }) {
  return (
    <Link
      href={`/work/${child.slug}`}
      className="group block border-t border-md-outline-variant py-4 first:border-t-0 first:pt-0"
    >
      <h4 className="text-[17px] font-medium leading-[1.2] tracking-[-0.01em] text-md-on-surface transition-colors group-hover:text-primary md:text-[18px]">
        {child.title}
      </h4>
      {child.description && (
        <p className="mt-1 max-w-[62ch] text-[13.5px] leading-[1.5] text-md-on-surface-variant">
          {child.description}
        </p>
      )}
    </Link>
  );
}
