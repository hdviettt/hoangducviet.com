interface ViewCountProps {
  count: number;
}

export function ViewCount({ count }: ViewCountProps) {
  if (count <= 0) return null;
  const label = count === 1 ? "view" : "views";
  return (
    <>
      <span className="opacity-50">·</span>
      <span className="tabular-nums">
        {count.toLocaleString()} {label}
      </span>
    </>
  );
}
