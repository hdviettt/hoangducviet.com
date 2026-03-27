"use client";

import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
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
  const [dot, setDot] = useState({ left: 0 });
  const [readingProgress, setReadingProgress] = useState(0);
  const [navSize, setNavSize] = useState({ width: 0, height: 0 });

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
      setDot({
        left: linkRect.right - navRect.left + 4,
      });
    }
  }, [activeIndex]);

  useEffect(() => {
    if (!isPostPage) {
      setReadingProgress(0);
      return;
    }
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      setReadingProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isPostPage]);

  useEffect(() => {
    if (!navRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].borderBoxSize[0]
        ? { width: entries[0].borderBoxSize[0].inlineSize, height: entries[0].borderBoxSize[0].blockSize }
        : navRef.current!.getBoundingClientRect();
      setNavSize({ width, height });
    });
    observer.observe(navRef.current);
    const rect = navRef.current.getBoundingClientRect();
    setNavSize({ width: rect.width, height: rect.height });
    return () => observer.disconnect();
  }, []);

  const pillPath = useMemo(() => {
    const { width: w, height: h } = navSize;
    if (!w || !h) return "";
    const sw = 2;
    const o = sw / 2;
    const r = h / 2;
    const ir = r - o;
    return [
      `M ${w / 2} ${o}`,
      `L ${w - r} ${o}`,
      `A ${ir} ${ir} 0 0 1 ${w - r} ${h - o}`,
      `L ${r} ${h - o}`,
      `A ${ir} ${ir} 0 0 1 ${r} ${o}`,
      `Z`,
    ].join(" ");
  }, [navSize]);

  return (
    <div className="min-h-screen bg-background">
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
              className={`nav-link text-sm md:text-base transition-colors ${
                item.match(pathname)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Sliding dot indicator */}
          {activeIndex >= 0 && (
            <div
              className="absolute w-1 h-1 bg-primary transition-all duration-300 ease-out"
              style={{
                left: dot.left,
                top: "50%",
                transform: "translateY(-50%)",
                borderRadius: "50%",
              }}
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

          {/* Reading progress — wraps around the pill */}
          {isPostPage && readingProgress > 0 && pillPath && (
            <svg
              className="absolute inset-0 pointer-events-none"
              width={navSize.width}
              height={navSize.height}
              style={{ overflow: "visible" }}
            >
              <path
                d={pillPath}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={100 - readingProgress}
                className="transition-[stroke-dashoffset] duration-150 ease-out"
              />
            </svg>
          )}
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
