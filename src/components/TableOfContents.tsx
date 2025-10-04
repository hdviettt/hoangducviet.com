"use client";

import { useEffect, useState } from "react";
import { List, X } from "lucide-react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Extract headings from the article content
    const articleContent = document.querySelector(".article-content");
    if (!articleContent) return;

    const headingElements = articleContent.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const items: TOCItem[] = [];

    headingElements.forEach((heading, index) => {
      const id = heading.id || `heading-${index}`;
      if (!heading.id) {
        heading.id = id;
      }

      items.push({
        id,
        text: heading.textContent || "",
        level: parseInt(heading.tagName[1]),
      });
    });

    setHeadings(items);

    // Set initial active heading
    if (items.length > 0) {
      setActiveId(items[0].id);
    }

    // Intersection Observer for active heading with improved detection
    const observerOptions = {
      rootMargin: "-20% 0px -35% 0px",
      threshold: [0, 0.25, 0.5, 0.75, 1],
    };

    let currentActive = items.length > 0 ? items[0].id : "";

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible heading
        const visibleHeadings = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            return a.boundingClientRect.top - b.boundingClientRect.top;
          });

        if (visibleHeadings.length > 0) {
          const topHeading = visibleHeadings[0];
          currentActive = topHeading.target.id;
          setActiveId(currentActive);
        }
      },
      observerOptions
    );

    headingElements.forEach((heading) => observer.observe(heading));

    // Also track scroll position for more accurate highlighting
    const handleScroll = () => {
      const headingsArray = Array.from(headingElements);
      const scrollPosition = window.scrollY + window.innerHeight * 0.25;

      for (let i = headingsArray.length - 1; i >= 0; i--) {
        const heading = headingsArray[i] as HTMLElement;
        if (heading.offsetTop <= scrollPosition) {
          setActiveId(heading.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (headings.length === 0) return null;

  return (
    <>
      {/* Desktop TOC */}
      <div className="hidden lg:block sticky top-4 bg-card border-2 border-border rounded-lg shadow-neo-md p-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="text-[10px] text-foreground mb-4 font-bold uppercase tracking-wider font-mono border-b-2 border-border pb-2">
          Contents
        </div>
        <nav className="space-y-1">
          {headings.map((heading) => {
            const indent = heading.level - 1;
            const isActive = activeId === heading.id;

            return (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                className={`block text-[10px] font-mono transition-colors py-1.5 rounded relative ${
                  isActive
                    ? "text-primary font-bold"
                    : "text-foreground hover:text-primary"
                }`}
                style={{
                  paddingLeft: `${8 + indent * 12}px`,
                }}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(heading.id)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                {indent > 0 && (
                  <span
                    className="absolute left-0 top-0 bottom-0 border-l-2 border-muted/40"
                    style={{ left: `${indent * 12 - 4}px` }}
                  />
                )}
                {heading.text}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Mobile TOC Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 z-40 bg-primary text-primary-foreground p-4 rounded-full shadow-neo-md border-2 border-border active:translate-x-1 active:translate-y-1"
        aria-label="Table of contents"
      >
        <List className="w-6 h-6" />
      </button>

      {/* Mobile TOC Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background overflow-y-auto">
          <div className="sticky top-0 bg-primary px-4 py-3 flex items-center justify-between border-b-4 border-border">
            <span className="text-primary-foreground font-mono text-sm font-bold uppercase">Contents</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="text-primary-foreground p-2 active:scale-95"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4">
            <nav className="space-y-2">
              {headings.map((heading) => {
                const indent = heading.level - 1;
                const isActive = activeId === heading.id;

                return (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    className={`block text-sm font-mono transition-colors py-2 px-3 rounded border-2 border-border ${
                      isActive
                        ? "bg-primary text-primary-foreground font-bold"
                        : "bg-card text-foreground hover:bg-muted/20"
                    }`}
                    style={{
                      marginLeft: `${indent * 16}px`,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileOpen(false);
                      document.getElementById(heading.id)?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                  >
                    {heading.text}
                  </a>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
