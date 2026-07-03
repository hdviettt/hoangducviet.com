"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface StatusToggleProps {
  slug: string;
  status: string;
  apiPath: "posts" | "projects" | "work";
}

export default function StatusToggle({ slug, status, apiPath }: StatusToggleProps) {
  const [current, setCurrent] = useState(status);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isPublished = current === "published";

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    const newStatus = isPublished ? "draft" : "published";
    try {
      const res = await fetch(`/api/${apiPath}/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCurrent(newStatus);
        router.refresh();
      }
    } catch {}
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      title={isPublished ? "Unpublish (set to draft)" : "Publish"}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 disabled:opacity-50 ${
        isPublished ? "bg-green-500/20" : "bg-muted"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full transition-all duration-200 ${
          isPublished
            ? "translate-x-[18px] bg-green-500"
            : "translate-x-[3px] bg-yellow-500"
        }`}
      />
    </button>
  );
}
