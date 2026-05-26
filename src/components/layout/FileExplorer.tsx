"use client";

import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

interface FileExplorerProps {
  children: ReactNode;
}

const navItems = [
  { href: "/", label: "home", match: (p: string) => p === "/" },
  { href: "/posts", label: "posts", match: (p: string) => p.startsWith("/posts") },
];

export default function FileExplorer({ children }: FileExplorerProps) {
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  const isPostPage =
    (pathname.startsWith("/posts/") && pathname !== "/posts") ||
    /^\/series\/[^/]+\/[^/]+\/?$/.test(pathname);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      setScrolled(scrollTop > 8);
      if (isPostPage) {
        const scrollHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        setReadingProgress(
          scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0,
        );
      } else {
        setReadingProgress(0);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isPostPage]);

  return (
    <div className="min-h-screen bg-background">
      {/* Reading progress — thin indigo bar pinned to the very top of the
          viewport. Visible only on post pages, sits above the navbar. */}
      {isPostPage && (
        <div
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none"
        >
          <div
            className="h-full bg-primary transition-[width] duration-150 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      )}

      {/* Sticky minimal header. Border-bottom fades in once the user scrolls
          past the hero so it doesn't compete with the page-opening composition. */}
      {/* M3 top app bar — 64px, surface tonal level 0 (flat) / level 2 once
          the user scrolls past the hero so the bar doesn't compete with the
          page-opening composition. */}
      <header
        className={`sticky top-0 z-40 bg-background/85 backdrop-blur-sm transition-shadow duration-200 ease-md-standard ${
          scrolled ? "md-elevation-2 border-b border-outline-variant" : ""
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-20 h-16 flex items-center justify-center">
          <nav className="flex items-center gap-6 md:gap-8">
            {navItems.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link md-label-large transition-colors duration-200 ease-md-standard ${
                    active
                      ? "text-primary"
                      : "text-md-on-surface-variant hover:text-md-on-surface"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <span className="w-px h-5 bg-md-outline-variant" />

            <button
              type="button"
              onClick={toggleTheme}
              className="md-btn md-btn-text md-btn-sm md-btn-pill"
              style={{ padding: 0, width: 40, height: 40 }}
              aria-label="Toggle theme"
            >
              {!mounted ? (
                <span className="w-5 h-5 inline-block" />
              ) : (
                <Icon
                  name={theme === "light" ? "dark_mode" : "light_mode"}
                  size={20}
                />
              )}
            </button>
          </nav>
        </div>
      </header>

      <main
        className={`mx-auto px-4 sm:px-6 lg:px-20 pb-16 ${
          isPostPage ? "max-w-6xl" : "max-w-4xl"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
