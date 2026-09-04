"use client";

import { useTheme } from "@/components/layout/ThemeProvider";
import { Icon } from "@/components/ui/Icon";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Mirrors the reader-facing top bar: 64px tall, sits on the page background
// with no hard rule under it, and carries the same circular outlined theme
// toggle in the same corner. Only the breadcrumb is admin-specific.

function getBreadcrumb(pathname: string): { section: string; page?: string } {
  if (pathname === "/admin") return { section: "Dashboard" };
  if (/^\/admin\/posts\/[^/]+\/edit$/.test(pathname))
    return { section: "Posts", page: "Edit" };
  if (pathname === "/admin/posts/new") return { section: "Posts", page: "New" };
  if (pathname.startsWith("/admin/posts")) return { section: "Posts" };
  if (/^\/admin\/projects\/[^/]+\/edit$/.test(pathname))
    return { section: "Collection", page: "Edit" };
  if (pathname === "/admin/projects/new")
    return { section: "Collection", page: "New" };
  if (pathname.startsWith("/admin/projects")) return { section: "Collection" };
  if (pathname.startsWith("/admin/categories"))
    return { section: "Categories" };
  if (pathname.startsWith("/admin/media")) return { section: "Media" };
  if (pathname.startsWith("/admin/internal-links"))
    return { section: "Internal links" };
  if (pathname.startsWith("/admin/settings")) return { section: "Settings" };
  return { section: "Admin" };
}

export default function AdminHeader() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { section, page } = getBreadcrumb(pathname);

  useEffect(() => setMounted(true), []);

  return (
    <header className="h-16 shrink-0 bg-md-background flex items-center gap-2 px-5 sm:px-8 lg:px-14 xl:px-20">
      <span
        className={`text-[14px] leading-5 ${
          page ? "text-md-on-surface-variant" : "text-md-on-surface font-medium"
        }`}
      >
        {section}
      </span>
      {page && (
        <>
          <Icon
            name="chevron_right"
            size={16}
            className="text-md-on-surface-variant/50 shrink-0"
          />
          <span className="text-[14px] leading-5 text-md-on-surface font-medium">
            {page}
          </span>
        </>
      )}

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
    </header>
  );
}
