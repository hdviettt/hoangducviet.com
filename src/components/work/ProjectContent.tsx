"use client";

import { useEffect, useRef } from "react";

export default function ProjectContent({ content }: { content: string }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    for (const code of container.querySelectorAll(
      "pre > code.language-render",
    )) {
      const pre = code.parentElement;
      if (!pre) continue;

      const visual = document.createElement("div");
      visual.className = "visual-embed my-8 not-prose";
      visual.innerHTML = code.textContent || "";
      pre.replaceWith(visual);
    }
  });

  return (
    <div
      ref={contentRef}
      className="article-content mx-auto mt-14 max-w-[38.75rem] md:mt-16"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
