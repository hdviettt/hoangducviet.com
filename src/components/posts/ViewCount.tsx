"use client";

import { useEffect, useState } from "react";

interface ViewCountProps {
  slug: string;
}

export function ViewCount({ slug }: ViewCountProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/posts/${encodeURIComponent(slug)}/views`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.count === "number") {
          setCount(data.count);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (count === null) return null;

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
