"use client";

import { useEffect, useState } from "react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface InlineTableOfContentsProps {
  content: string;
}

export default function InlineTableOfContents({
  content,
}: InlineTableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  // Extract headings from markdown content
  useEffect(() => {
    // Fix malformed markdown where image and heading are concatenated
    const fixed = content.replace(
      /(\!\[[^\]]*\]\([^)]*\))(\s*)(#{1,6}\s)/g,
      "$1\n$3",
    );
    const lines = fixed.split("\n");
    const items: TOCItem[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();

        items.push({ id, text, level });
      }
    });

    setHeadings(items);
  }, [content]);

  // Handle scroll to highlight active heading
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const headingElements = headings
        .map((h) => document.getElementById(h.id))
        .filter((el): el is HTMLElement => el !== null);

      if (headingElements.length === 0) return;

      // Find which heading is currently in view
      let currentId = headings[0]?.id || "";

      for (const el of headingElements) {
        const rect = el.getBoundingClientRect();
        // If the heading is above the middle of the viewport, it's the active one
        if (rect.top <= 100) {
          currentId = el.id;
        } else {
          break;
        }
      }

      setActiveId(currentId);
    };

    // Initial check
    setTimeout(handleScroll, 100);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  if (headings.length === 0) return null;

  const minLevel = Math.min(...headings.map((h) => h.level));

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
    }
  };

  return (
    <div>
      <div
        className="text-xs font-medium mb-4 uppercase tracking-wider"
        style={{ color: "var(--article-text)" }}
      >
        On this page
      </div>
      <nav className="space-y-0.5 border-l-2" style={{ borderColor: "var(--article-border)" }}>
        {headings.map((heading) => {
          const indent = heading.level - minLevel;
          const isActive = activeId === heading.id;

          return (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className={`block text-sm py-1.5 transition-colors border-l-2 -ml-0.5 ${
                isActive ? "font-medium" : ""
              }`}
              style={{
                paddingLeft: `${14 + indent * 14}px`,
                color: isActive
                  ? "var(--article-heading)"
                  : "var(--article-text)",
                borderColor: isActive
                  ? "var(--article-link)"
                  : "transparent",
              }}
            >
              {heading.text}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
