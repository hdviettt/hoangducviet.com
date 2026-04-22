"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

function getBreadcrumb(pathname: string): { section: string; page?: string } {
  if (pathname === "/admin") return { section: "dashboard" };
  if (/^\/admin\/posts\/[^/]+\/edit$/.test(pathname)) return { section: "posts", page: "edit" };
  if (pathname === "/admin/posts/new") return { section: "posts", page: "new" };
  if (pathname.startsWith("/admin/posts")) return { section: "posts" };
  if (/^\/admin\/projects\/[^/]+\/edit$/.test(pathname)) return { section: "projects", page: "edit" };
  if (pathname === "/admin/projects/new") return { section: "projects", page: "new" };
  if (pathname.startsWith("/admin/projects")) return { section: "projects" };
  if (pathname.startsWith("/admin/categories")) return { section: "categories" };
  if (pathname.startsWith("/admin/media")) return { section: "media" };
  if (pathname.startsWith("/admin/internal-links")) return { section: "internal links" };
  if (pathname.startsWith("/admin/settings")) return { section: "settings" };
  return { section: "admin" };
}

export default function AdminHeader() {
  const pathname = usePathname();
  const { section, page } = getBreadcrumb(pathname);

  return (
    <header className="h-11 shrink-0 border-b border-border bg-card flex items-center px-8 gap-2">
      <span className={`text-sm ${page ? "text-muted-foreground" : "font-medium text-foreground"}`}>
        {section}
      </span>
      {page && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
          <span className="text-sm font-medium text-foreground">{page}</span>
        </>
      )}
    </header>
  );
}
