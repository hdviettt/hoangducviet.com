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
    <nav aria-label="On this page">
      <div className="text-[15px] font-medium text-md-on-surface mb-5">
        In this story
      </div>
      <ul className="relative border-l border-md-outline-variant">
        {headings.map((heading) => {
          const indent = heading.level - minLevel;
          const isActive = activeId === heading.id;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                style={{ paddingLeft: `${16 + indent * 14}px` }}
                className={`block py-2 pr-3 -ml-px border-l-[3px] text-[14px] leading-[20px] transition-colors duration-200 ease-md-standard ${
                  isActive
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-md-on-surface/70 hover:text-md-on-surface"
                }`}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
