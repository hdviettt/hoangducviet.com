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
    <aside className="admin-sidebar">
      <div className="mb-8">
        <Link href="/" className="text-[#888] hover:text-white text-xs">
          ← Site
        </Link>
        <h2 className="text-white text-base font-semibold mt-3">Admin</h2>
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
              className={`admin-nav-item ${isActive ? "active" : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="text-[#666] hover:text-[#f87171] text-sm mt-6 text-left"
      >
        Logout
      </button>
    </aside>
  );
}
