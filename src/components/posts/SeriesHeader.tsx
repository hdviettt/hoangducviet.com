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
      className="deck-label group hover:text-primary transition-colors"
    >
      <span className="tabular-nums">
        part {String(partNumber).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
      <span className="opacity-50 mx-2">·</span>
      <span>{project.title}</span>
    </Link>
  );
}
