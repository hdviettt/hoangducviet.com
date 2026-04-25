import Link from "next/link";

interface SeriesHeaderProps {
  project: { slug: string; title: string };
  partNumber: number;
  total: number;
}

export default function SeriesHeader({
  project,
  partNumber,
  total,
}: SeriesHeaderProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group inline-flex items-center gap-2.5 mb-6 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
    >
      <span className="px-1.5 py-0.5 border border-border group-hover:border-primary/40 transition-colors tabular-nums">
        Part {partNumber} / {total}
      </span>
      <span className="opacity-60">·</span>
      <span className="normal-case tracking-normal">{project.title}</span>
    </Link>
  );
}
