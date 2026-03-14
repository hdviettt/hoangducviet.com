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
  const navRef = useRef<HTMLElement>(null);
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
      {/* Floating pill navbar */}
      <header className="sticky top-0 z-50 flex justify-center py-3 pointer-events-none">
        <nav
          ref={navRef}
          className="relative flex items-center gap-0 border border-border bg-background/80 backdrop-blur-md shadow-lg pointer-events-auto px-1 py-1"
          style={{ borderRadius: "9999px" }}
        >
          {/* Sliding active indicator */}
          {activeIndex >= 0 && (
            <div
              className="absolute top-1 bottom-1 bg-muted transition-all duration-300 ease-out"
              style={{
                left: indicator.left,
                width: indicator.width,
                borderRadius: "9999px",
              }}
            />
          )}

          {navItems.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              data-nav-index={i}
              className={`relative z-10 px-4 py-1.5 text-sm transition-colors ${
                item.match(pathname)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={{ borderRadius: "9999px" }}
            >
              {item.label}
            </Link>
          ))}

          {/* Separator */}
          <div className="w-px h-5 bg-border mx-1" />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="relative z-10 p-2 text-muted-foreground hover:text-foreground transition-colors"
            style={{ borderRadius: "9999px" }}
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
