"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "~" },
  { href: "/admin/posts", label: "Posts", icon: ">" },
  { href: "/admin/pages", label: "Pages", icon: "#" },
  { href: "/admin/projects", label: "Projects", icon: "&" },
  { href: "/admin/categories", label: "Categories", icon: "@" },
  { href: "/admin/media", label: "Media", icon: "%" },
  { href: "/admin/settings", label: "Settings", icon: "*" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <aside className="w-56 border-r border-border bg-card min-h-screen p-4 flex flex-col">
      <div className="mb-6">
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          ← Back to site
        </Link>
        <h2 className="text-sm font-medium mt-3 uppercase tracking-wider">
          Admin
        </h2>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "text-primary bg-primary/10 border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span className="font-mono text-xs w-4">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 px-3 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors text-left"
      >
        Logout
      </button>
    </aside>
  );
}
