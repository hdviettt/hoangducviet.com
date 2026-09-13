"use client";
import { ThemeToggle } from "@/components/layout/theme";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

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
          className="fixed top-0 left-0 right-0 h-[0.1875rem] z-50 pointer-events-none"
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
        {/* The bar is nested `work-breakout` inside `site-shell`, the way every
            band on every page already is, so the first nav link starts on the
            same vertical line as the content underneath it. Nested rather than
            swapped: `work-breakout` carries no width rule below 1024, so on its
            own it runs the bar edge to edge and drops the first link to x=0 on
            a phone.

            Measured at 360px: the row wants 403px, of which the theme toggle
            and its gap are 48. Tightening the gaps on a phone buys most of that
            back, and `flex-wrap` covers the rest — a nav that runs out of room
            drops to a second line instead of pushing the page sideways. */}
        <div className="site-shell">
          <div className="work-breakout flex min-h-16 flex-wrap items-center gap-x-3 gap-y-1 py-2 sm:flex-nowrap sm:gap-x-8 sm:py-0">
            {/* No wordmark. Home is the first nav item, so the site is still one
                click from anywhere, and the nav now starts at the content edge
                instead of being pushed right by a name. */}
            <nav className="flex items-center gap-2.5 sm:gap-6">
              {navItems.map((item) => {
                const active = item.match(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-[0.8125rem] leading-5 sm:text-[0.9375rem] transition-colors duration-200 ease-md-standard ${
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

            {/* Out of <nav>, because a theme switch is not navigation, and
                held at the far edge so the bar is not one huddle on the left. */}
            <span className="ml-auto flex items-center">
              <ThemeToggle />
            </span>
          </div>
        </div>
      </header>

      <main className="site-shell pb-16">{children}</main>
    </div>
  );
}
