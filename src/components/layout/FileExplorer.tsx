"use client";

import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeProvider";

interface FileExplorerProps {
  children: ReactNode;
}

const navItems = [
  { href: "/", label: "home", match: (p: string) => p === "/" },
  {
    href: "/posts",
    label: "posts",
    match: (p: string) => p.startsWith("/posts"),
  },
  {
    href: "/projects",
    label: "projects",
    match: (p: string) => p.startsWith("/projects"),
  },
];

export default function FileExplorer({ children }: FileExplorerProps) {
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();
  const navRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const isPostPage = pathname.startsWith("/posts/") && pathname !== "/posts";
  const activeIndex = navItems.findIndex((item) => item.match(pathname));

  useEffect(() => {
    if (!navRef.current) return;
    const activeLink = navRef.current.querySelector(
      `[data-nav-index="${activeIndex}"]`,
    ) as HTMLElement | null;
    if (activeLink) {
      const navRect = navRef.current.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      setIndicator({
        left: linkRect.left - navRect.left,
        width: linkRect.width,
      });
    }
  }, [activeIndex]);

  return (
    <div className="min-h-screen bg-background font-mono">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="h-12 flex items-center justify-between">
            {/* Pill Navigation */}
            <nav
              ref={navRef}
              className="relative flex items-center gap-1 bg-muted/50 rounded-full p-1"
            >
              {/* Sliding indicator */}
              {activeIndex >= 0 && (
                <div
                  className="absolute top-1 bottom-1 bg-primary/15 rounded-full transition-all duration-300 ease-out"
                  style={{ left: indicator.left, width: indicator.width }}
                />
              )}
              {navItems.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  data-nav-index={i}
                  className={`relative z-10 px-3 sm:px-4 py-1 text-xs sm:text-sm transition-colors rounded-full ${
                    item.match(pathname)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="hover:text-primary transition-colors p-1.5 text-muted-foreground"
            >
              {!mounted ? (
                <div className="w-4 h-4" />
              ) : theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main
        className={`mx-auto px-4 sm:px-6 pb-16 ${isPostPage ? "max-w-5xl" : "max-w-4xl"}`}
      >
        {children}
      </main>
    </div>
  );
}
