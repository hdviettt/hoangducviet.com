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

  useEffect(() => {
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

  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const headingElements = headings
        .map((h) => document.getElementById(h.id))
        .filter((el): el is HTMLElement => el !== null);

      if (headingElements.length === 0) return;

      let currentId = headings[0]?.id || "";
      for (const el of headingElements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 100) {
          currentId = el.id;
        } else {
          break;
        }
      }
      setActiveId(currentId);
    };

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
    <nav aria-label="On this page" className="md-toc">
      <div className="md-label-medium uppercase tracking-widest text-md-on-surface-variant mb-3 px-4">
        On this page
      </div>
      <ul className="space-y-0.5">
        {headings.map((heading) => {
          const indent = heading.level - minLevel;
          const isActive = activeId === heading.id;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                style={{ paddingLeft: `${16 + indent * 14}px` }}
                className={`flex items-center min-h-9 pr-3 py-1 rounded-full md-body-small transition-colors duration-200 ease-md-standard ${
                  isActive
                    ? "bg-md-secondary-container text-md-on-secondary-container font-medium"
                    : "text-md-on-surface-variant hover:bg-md-on-surface/8 hover:text-md-on-surface"
                }`}
              >
                <span className="line-clamp-2 leading-snug">{heading.text}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
