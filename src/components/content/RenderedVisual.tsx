"use client";

import { useRef, useEffect } from "react";

export default function RenderedVisual({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Re-create <script> tags so the browser actually executes them
    // (innerHTML / dangerouslySetInnerHTML don't run scripts)
    const scripts = containerRef.current.querySelectorAll("script");
    for (const oldScript of scripts) {
      const newScript = document.createElement("script");
      for (const attr of oldScript.attributes) {
        newScript.setAttribute(attr.name, attr.value);
      }
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    }
  }, [html]);

  return (
    <div
      ref={containerRef}
      className="visual-embed my-8 not-prose"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
