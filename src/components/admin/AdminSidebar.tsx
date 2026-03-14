"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <aside className="w-52 border-r border-neutral-800 bg-neutral-900 min-h-screen p-4 flex flex-col">
      <div className="mb-6">
        <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-300">
          ← Back to site
        </Link>
        <h2 className="text-sm font-semibold mt-3 text-neutral-300">Admin</h2>
      </div>

      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-1.5 text-sm rounded transition-colors ${
                isActive
                  ? "text-white bg-neutral-800"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
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
        className="mt-4 px-3 py-1.5 text-sm text-neutral-500 hover:text-red-400 transition-colors text-left"
      >
        Logout
      </button>
    </aside>
  );
}
