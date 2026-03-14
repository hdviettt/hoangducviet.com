"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "dashboard" },
  { href: "/admin/posts", label: "posts" },
  { href: "/admin/projects", label: "projects" },
  { href: "/admin/categories", label: "categories" },
  { href: "/admin/media", label: "media" },
  { href: "/admin/settings", label: "settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <aside className="w-48 border-r border-border bg-card min-h-screen py-6 px-3 flex flex-col shrink-0">
      <div className="px-3 mb-6">
        <Link href="/" className="text-xs text-muted-foreground hover:text-primary">
          ← site
        </Link>
        <div className="text-sm text-primary font-medium mt-2">admin</div>
      </div>

      <nav className="flex-1 space-y-px">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-1.5 text-sm transition-colors ${
                isActive
                  ? "text-primary border-l-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="px-3 text-xs text-muted-foreground hover:text-destructive text-left mt-4"
      >
        logout
      </button>
    </aside>
  );
}
