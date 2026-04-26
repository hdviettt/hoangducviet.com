"use client";

import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

interface FileExplorerProps {
  children: ReactNode;
}

const navItems = [
  { href: "/", label: "home", match: (p: string) => p === "/" },
];

export default function FileExplorer({ children }: FileExplorerProps) {
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  const isPostPage = pathname.startsWith("/posts/") && pathname !== "/posts";

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
      <header
        className={`sticky top-0 z-40 bg-background/85 backdrop-blur-sm transition-colors duration-200 ${
          scrolled ? "border-b border-border/60" : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex items-center justify-end h-14 md:h-16">
          <nav className="flex items-center gap-5 sm:gap-6 md:gap-7">
            {navItems.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link text-sm transition-colors ${
                    active
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="w-px h-4 bg-border" />

            <button
              type="button"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {!mounted ? (
                <div className="w-4 h-4" />
              ) : theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>
          </nav>
        </div>
      </header>

      <main
        className={`mx-auto px-4 sm:px-6 pb-16 ${isPostPage ? "max-w-6xl" : "max-w-4xl"}`}
      >
        {children}
      </main>
    </div>
  );
}
