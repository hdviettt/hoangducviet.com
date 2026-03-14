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
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

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
      setUnderline({
        left: linkRect.left - navRect.left,
        width: linkRect.width,
      });
    }
  }, [activeIndex]);

  return (
    <div className="min-h-screen bg-background font-mono">
      <header className="sticky top-0 z-50 flex justify-center pt-4 pointer-events-none">
        <nav
          ref={navRef}
          className="relative flex items-center gap-5 px-5 py-2 border border-border/60 bg-background/80 backdrop-blur-md shadow-lg pointer-events-auto"
          style={{ borderRadius: "9999px" }}
        >
          {navItems.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              data-nav-index={i}
              className={`text-sm pb-1 transition-colors ${
                item.match(pathname)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Sliding underline */}
          {activeIndex >= 0 && (
            <div
              className="absolute bottom-2 h-[2px] bg-primary transition-all duration-300 ease-out"
              style={{ left: underline.left, width: underline.width }}
            />
          )}

          {/* Separator */}
          <div className="w-px h-4 bg-border/60" />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
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
