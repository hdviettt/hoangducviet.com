"use client";

import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeProvider";

interface FileExplorerProps {
  children: ReactNode;
}

const navItems = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  {
    href: "/work",
    label: "Work",
    match: (p: string) => p.startsWith("/work"),
  },
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
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const [readingProgress, setReadingProgress] = useState(0);

  const isPostPage =
    (pathname.startsWith("/posts/") && pathname !== "/posts") ||
    /^\/series\/[^/]+\/[^/]+\/?$/.test(pathname);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      setScrolled(scrollTop > 8);
      // deepmind.google detail: the bar slides away while reading down and
      // returns the moment you scroll back up.
      const delta = scrollTop - lastY.current;
      if (scrollTop < 96) setHidden(false);
      else if (delta > 4) setHidden(true);
      else if (delta < -4) setHidden(false);
      lastY.current = scrollTop;
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

  // App Router keeps the scroll position when navigating between two pages
  // of the same dynamic route (post → next post lands at the bottom), so
  // reset it ourselves. Skip the first render so hash links from outside
  // (#section) still land on their anchor.
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);

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

      {/* deepmind.google top bar: wordmark left, plain text links, pill action
          right. No hard border — a translucent blur is the only edge; the bar
          slides out of view on scroll-down and back on scroll-up. */}
      <header
        className={`sticky top-0 z-40 transition-[transform,background-color,backdrop-filter] duration-300 ease-md-standard ${
          hidden ? "-translate-y-full" : "translate-y-0"
        } ${
          scrolled ? "bg-md-background/80 backdrop-blur-lg" : "bg-md-background"
        }`}
      >
        <div className="mx-auto max-w-[1140px] px-5 sm:px-8 lg:px-12 h-16 flex items-center gap-8">
          <Link
            href="/"
            className="text-[17px] font-medium tracking-tight text-md-on-surface whitespace-nowrap"
          >
            Hoang Duc Viet
          </Link>

          <nav className="hidden sm:flex items-center gap-6">
            {navItems.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[14px] leading-5 transition-colors duration-200 ease-md-standard ${
                    active
                      ? "text-md-on-surface font-medium"
                      : "text-md-on-surface-variant hover:text-md-on-surface"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-md-outline text-md-on-surface-variant hover:bg-md-on-surface/5 hover:text-md-on-surface transition-colors duration-200 ease-md-standard"
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
        </div>
      </header>

      <main className="mx-auto max-w-[1140px] px-5 sm:px-8 lg:px-12 pb-16">
        {children}
      </main>
    </div>
  );
}
