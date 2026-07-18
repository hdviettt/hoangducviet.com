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

      {/* deepmind.google top bar: wordmark left, plain text links, pill action
          right. Flat white at rest; hairline + blur only after scrolling. */}
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ease-md-standard ${
          scrolled
            ? "bg-md-surface/90 backdrop-blur-md border-b border-md-outline-variant"
            : "bg-md-background"
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 h-16 flex items-center gap-8">
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
            <Link
              href="/about"
              className="hidden md:inline-flex items-center h-10 px-5 rounded-full border border-md-outline text-[14px] font-medium text-md-on-surface hover:bg-md-on-surface/5 transition-colors duration-200 ease-md-standard"
            >
              About me
            </Link>
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

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pb-16">
        {children}
      </main>
    </div>
  );
}
