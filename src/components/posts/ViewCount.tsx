import { Eye } from "lucide-react";

interface ViewCountProps {
  count: number;
  /** When true, pushes itself to the far right via `ml-auto`. Used in
   *  post-detail metadata row to separate the engagement signal from
   *  the date/reading-time cluster. */
  rightAligned?: boolean;
}

export function ViewCount({ count, rightAligned = false }: ViewCountProps) {
  if (count <= 0) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 tabular-nums ${
        rightAligned ? "ml-auto" : ""
      }`}
      aria-label={`${count} ${count === 1 ? "view" : "views"}`}
    >
      <Eye className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
      {count.toLocaleString()}
    </span>
  );
}
