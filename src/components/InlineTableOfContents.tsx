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

export default function InlineTableOfContents({ content }: InlineTableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Extract headings from markdown content
    const lines = content.split('\n');
    const items: TOCItem[] = [];

    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        items.push({ id, text, level });
      }
    });

    setHeadings(items);

    if (items.length > 0) {
      setActiveId(items[0].id);
    }
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    // Find the scroll container (the div with overflow-auto)
    const scrollContainer = document.querySelector('.h-full.overflow-auto') as HTMLElement;
    if (!scrollContainer) return;

    // Track scroll position to update active heading
    const handleScroll = () => {
      const headingElements = document.querySelectorAll(".article-content h1, .article-content h2, .article-content h3, .article-content h4, .article-content h5, .article-content h6");
      const headingsArray = Array.from(headingElements) as HTMLElement[];

      if (headingsArray.length === 0) return;

      // Get scroll position from the scroll container
      const scrollPosition = scrollContainer.scrollTop + 200;

      // Find the current active heading by checking which one we've scrolled past
      let currentActiveId = headingsArray[0].id;

      for (const heading of headingsArray) {
        // Get position relative to the scroll container
        const headingTop = heading.offsetTop;

        if (headingTop <= scrollPosition) {
          currentActiveId = heading.id;
        } else {
          break;
        }
      }

      setActiveId(currentActiveId);
    };

    // Wait for headings to be rendered in the DOM, then set up scroll listener
    const timer = setTimeout(() => {
      handleScroll(); // Initial call to set active heading
    }, 300);

    // Listen to scroll events on the scroll container
    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto overflow-x-hidden">
      <div className="text-xs font-semibold uppercase tracking-wider mb-4 text-muted-foreground">
        Table of Contents
      </div>
      <nav className="space-y-2">
        {headings.map((heading) => {
          const indent = heading.level - 1;
          const isActive = activeId === heading.id;

          return (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={`block text-sm transition-all duration-200 break-words ${
                isActive
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:translate-x-1"
              }`}
              style={{
                paddingLeft: `${indent * 16}px`,
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
              }}
              onClick={(e) => {
                e.preventDefault();
                setActiveId(heading.id);
                const element = document.getElementById(heading.id);
                const scrollContainer = document.querySelector('.h-full.overflow-auto') as HTMLElement;

                if (element && scrollContainer) {
                  // Calculate position relative to the scroll container
                  const elementTop = element.offsetTop;
                  scrollContainer.scrollTo({
                    top: elementTop - 100,
                    behavior: "smooth",
                  });
                }
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
