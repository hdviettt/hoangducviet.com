"use client";

import { Icon } from "@/components/ui/Icon";
import { IDENTITY } from "@/lib/identity";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// The rail speaks the public site's language: background, hairline edges,
// 14px links that go medium when active, sentence case. No pills, no
// uppercase-tracked section labels — neither exists on the reader-facing side.

const navSections = [
  {
    label: "Content",
    items: [
      { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
      { href: "/admin/posts", label: "Posts", icon: "description" },
      { href: "/admin/projects", label: "Series", icon: "folder" },
      { href: "/admin/categories", label: "Categories", icon: "label" },
    ],
  },
  {
    label: "Assets",
    items: [{ href: "/admin/media", label: "Media", icon: "image" }],
  },
  {
    label: "System",
    items: [
      { href: "/admin/internal-links", label: "Internal links", icon: "link" },
      { href: "/admin/settings", label: "Settings", icon: "settings" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("admin-sidebar-collapsed") === "true") {
      setCollapsed(true);
    }
  }, []);

  const toggle = () =>
    setCollapsed((prev) => {
      localStorage.setItem("admin-sidebar-collapsed", String(!prev));
      return !prev;
    });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const row = (active: boolean) =>
    `flex items-center gap-3 h-9 rounded-lg text-[14px] leading-5 transition-colors duration-200 ease-md-standard ${
      collapsed ? "justify-center" : "px-3"
    } ${
      active
        ? "bg-md-surface-container text-md-on-surface font-medium"
        : "text-md-on-surface-variant hover:bg-md-on-surface/5 hover:text-md-on-surface"
    }`;

  return (
    <aside
      className={`relative bg-md-background border-r border-md-outline-variant h-screen flex flex-col shrink-0 transition-[width] duration-200 ease-md-standard ${
        collapsed ? "w-14" : "w-60"
      }`}
    >
      <button
        type="button"
        onClick={toggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute top-1/2 -translate-y-1/2 -right-3 z-30 w-6 h-6 rounded-full border border-md-outline-variant bg-md-background flex items-center justify-center text-md-on-surface-variant hover:text-md-on-surface hover:border-md-outline transition-colors duration-200 ease-md-standard"
      >
        <Icon
          name="chevron_left"
          size={16}
          className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
        />
      </button>

      {/* Same wordmark, same 17px medium tracking-tight, as the reader's header */}
      <div className="h-16 flex items-center px-3 shrink-0">
        {collapsed ? (
          <Link
            href="/"
            title="View site"
            className="w-8 h-8 mx-auto inline-flex items-center justify-center rounded-lg text-md-on-surface hover:bg-md-on-surface/5 transition-colors duration-200 ease-md-standard"
          >
            <span className="text-[15px] font-medium tracking-tight">
              {IDENTITY.name.charAt(0)}
            </span>
          </Link>
        ) : (
          <Link
            href="/"
            className="px-3 text-[17px] font-medium tracking-tight text-md-on-surface whitespace-nowrap hover:text-md-primary transition-colors duration-200 ease-md-standard"
            title="View site"
          >
            {IDENTITY.name}
          </Link>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto min-h-0 pb-2">
        {navSections.map((section, i) => (
          <div key={section.label} className="mb-1">
            {collapsed ? (
              i > 0 && (
                <div className="border-t border-md-outline-variant mx-3 my-2" />
              )
            ) : (
              <div className="text-[12px] leading-4 text-md-on-surface-variant px-3 mt-4 mb-1.5">
                {section.label}
              </div>
            )}
            <div className="px-2 space-y-0.5">
              {section.items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={row(active)}
                  >
                    <Icon
                      name={item.icon}
                      size={20}
                      className="shrink-0"
                      filled={active}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-md-outline-variant py-2 px-2 shrink-0">
        <button
          type="button"
          onClick={handleLogout}
          title="Log out"
          className={`w-full ${row(false)}`}
        >
          <Icon name="logout" size={20} className="shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}
