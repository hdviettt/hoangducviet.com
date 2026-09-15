"use client";

import WidgetBlock from "@/components/widgets/WidgetBlock";
import { useEffect, useRef } from "react";
import { type Root, createRoot } from "react-dom/client";

function parseWidgetProps(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw.trim() || "{}");
    return Array.isArray(parsed) ? { items: parsed } : parsed;
  } catch {
    return { children: raw };
  }
}

export default function ProjectContent({ content }: { content: string }) {
  const contentRef = useRef<HTMLDivElement>(null);

  // The HTML prop is the trigger for rebuilding the DOM-backed widget mounts.
  // biome-ignore lint/correctness/useExhaustiveDependencies: content triggers DOM replacement
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    const roots: Root[] = [];

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

    for (const code of container.querySelectorAll(
      "pre > code[class*='language-widget:']",
    )) {
      const pre = code.parentElement;
      if (!pre) continue;
      const language = Array.from(code.classList).find((name) =>
        name.startsWith("language-widget:"),
      );
      if (!language) continue;

      const mount = document.createElement("div");
      pre.replaceWith(mount);
      const root = createRoot(mount);
      roots.push(root);
      root.render(
        <WidgetBlock
          name={language.replace("language-widget:", "")}
          props={parseWidgetProps(code.textContent || "")}
        />,
      );
    }

    for (const embed of container.querySelectorAll("[data-carousel-embed]")) {
      const mount = document.createElement("div");
      embed.replaceWith(mount);
      const root = createRoot(mount);
      roots.push(root);
      const items = embed.getAttribute("data-items") || "[]";
      const ratio = embed.getAttribute("data-ratio") || "16 / 9";
      const mat = embed.getAttribute("data-mat") || "brand";
      root.render(
        <WidgetBlock
          name="carousel"
          props={{
            ...parseWidgetProps(items),
            ratio,
            mat,
          }}
        />,
      );
    }

    return () => {
      for (const root of roots) root.unmount();
    };
  }, [content]);

  return (
    <div
      ref={contentRef}
      className="project-content article-content mx-auto mt-14 max-w-[38.75rem] md:mt-16"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
