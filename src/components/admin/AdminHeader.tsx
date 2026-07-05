"use client";

import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

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
    <header className="h-11 shrink-0 border-b border-md-outline-variant bg-md-surface-container-low flex items-center px-8 gap-2">
      <span className={`md-label-large ${page ? "text-md-on-surface-variant" : "text-md-on-surface"}`}>
        {section}
      </span>
      {page && (
        <>
          <Icon name="chevron_right" size={16} className="text-md-on-surface-variant/50 shrink-0" />
          <span className="md-label-large text-md-on-surface">{page}</span>
        </>
      )}
    </header>
  );
}
