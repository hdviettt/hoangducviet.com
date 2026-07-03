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
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  {
    href: "/posts",
    label: "Posts",
    match: (p: string) => p.startsWith("/posts"),
  },
  {
    href: "/about",
    label: "About",
    match: (p: string) => p.startsWith("/about"),
  },
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
    <div className="min-h-screen bg-md-background">
      {/* Reading progress bar — pinned to the very top on post pages */}
      {isPostPage && (
        <div
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 h-[3px] z-50 pointer-events-none"
        >
          <div
            className="h-full bg-primary transition-[width] duration-150 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      )}

      {/* Minimal centered M3 top app bar — no brand, pill nav, theme toggle.
          Flat at rest, elevation + blur once the user scrolls past the hero. */}
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ease-md-standard ${
          scrolled
            ? "bg-md-surface/85 backdrop-blur-md shadow-md-1 border-b border-md-outline-variant"
            : "bg-md-background"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-center gap-1">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`h-10 px-5 rounded-full inline-flex items-center md-label-large transition-colors duration-200 ease-md-standard ${
                    active
                      ? "bg-md-secondary-container text-md-on-secondary-container"
                      : "text-md-on-surface-variant hover:bg-md-on-surface/8 hover:text-md-on-surface"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <span className="mx-2 w-px h-5 bg-md-outline-variant" />

          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 inline-flex items-center justify-center rounded-full text-md-on-surface-variant hover:bg-md-on-surface/8 hover:text-md-on-surface transition-colors duration-200 ease-md-standard"
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
        </div>
      </header>

      <main
        className={`mx-auto px-4 sm:px-6 lg:px-10 pb-16 ${
          isPostPage ? "max-w-6xl" : "max-w-4xl"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
