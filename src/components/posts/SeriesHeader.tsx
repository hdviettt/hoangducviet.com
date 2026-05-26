import Link from "next/link";

interface SeriesHeaderProps {
  series: { slug: string; title: string };
  partNumber: number;
  total: number;
}

export default function SeriesHeader({
  series,
  partNumber,
  total,
}: SeriesHeaderProps) {
  return (
    <Link
      href={`/series/${series.slug}`}
      className="md-label-medium uppercase tracking-widest text-md-on-surface-variant hover:text-primary transition-colors duration-200 ease-md-standard inline-flex items-center gap-2"
    >
      <span className="tabular-nums">
        part {String(partNumber).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
      <span className="opacity-50">·</span>
      <span>{series.title}</span>
    </Link>
  );
}
