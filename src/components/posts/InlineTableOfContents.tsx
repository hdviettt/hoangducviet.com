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
    const all: TOCItem[] = [];

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
        all.push({ id, text, level });
      }
    });

    // Show only the top-level headings (the shallowest level present).
    // Blog.google TOCs surface section anchors, not every nested H3/H4.
    if (all.length === 0) {
      setHeadings([]);
      return;
    }
    const minLevel = Math.min(...all.map((h) => h.level));
    setHeadings(all.filter((h) => h.level === minLevel));
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
          const isActive = activeId === heading.id;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={`block py-2 pl-4 pr-3 -ml-px border-l-[3px] text-[14px] leading-[20px] transition-colors duration-200 ease-md-standard ${
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
