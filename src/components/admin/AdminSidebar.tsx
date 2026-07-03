"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Icon } from "@/components/ui/Icon";

const navSections = [
  {
    label: "content",
    items: [
      { href: "/admin", label: "dashboard", icon: "dashboard", exact: true },
      { href: "/admin/posts", label: "posts", icon: "description" },
      { href: "/admin/projects", label: "series", icon: "folder" },
      { href: "/admin/work", label: "projects", icon: "deployed_code" },
      { href: "/admin/categories", label: "categories", icon: "label" },
    ],
  },
  {
    label: "assets",
    items: [{ href: "/admin/media", label: "media", icon: "image" }],
  },
  {
    label: "system",
    items: [
      { href: "/admin/internal-links", label: "internal links", icon: "link" },
      { href: "/admin/settings", label: "settings", icon: "settings" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      localStorage.setItem("admin-sidebar-collapsed", String(!prev));
      return !prev;
    });
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <aside
      className={`relative bg-md-surface-container-low border-r border-md-outline-variant h-screen flex flex-col shrink-0 transition-[width] duration-200 ease-md-standard ${
        collapsed ? "w-14" : "w-60"
      }`}
    >
      {/* Collapse toggle — circular outlined icon button on the edge */}
      <button
        type="button"
        onClick={toggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute top-1/2 -translate-y-1/2 -right-3 z-30 w-6 h-6 rounded-full border border-md-outline-variant bg-md-surface flex items-center justify-center text-md-on-surface-variant hover:bg-md-primary hover:text-md-on-primary hover:border-md-primary transition-colors duration-200 ease-md-standard"
      >
        <Icon
          name="chevron_left"
          size={16}
          className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
        />
      </button>

      {/* Header area */}
      <div className="pt-5 pb-4 px-3">
        <Link
          href="/"
          className="md-label-medium text-md-on-surface-variant hover:text-md-primary flex items-center gap-2 transition-colors duration-200 ease-md-standard"
          title="View site"
        >
          <Icon name="open_in_new" size={16} className="shrink-0" />
          {!collapsed && <span>view site</span>}
        </Link>
        {!collapsed && (
          <div className="md-title-medium text-md-primary mt-3">admin</div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto min-h-0 py-2">
        {navSections.map((section, sectionIdx) => (
          <div key={section.label} className="mb-2">
            {/* Section divider for collapsed state */}
            {collapsed && sectionIdx > 0 && (
              <div className="border-t border-md-outline-variant mx-3 mb-2" />
            )}
            {/* Section label */}
            {!collapsed && (
              <div className="md-label-medium uppercase tracking-widest text-md-on-surface-variant px-5 mt-3 mb-1">
                {section.label}
              </div>
            )}
            <div className={collapsed ? "px-2 space-y-1" : "px-3 space-y-1"}>
              {section.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 h-10 rounded-full md-label-large transition-colors duration-200 ease-md-standard ${
                      collapsed ? "justify-center" : "px-4"
                    } ${
                      isActive
                        ? "bg-md-secondary-container text-md-on-secondary-container"
                        : "text-md-on-surface-variant hover:bg-md-on-surface/8 hover:text-md-on-surface"
                    }`}
                  >
                    <Icon name={item.icon} size={20} className="shrink-0" filled={isActive} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-md-outline-variant py-3 px-3 space-y-1 shrink-0">
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === "light" ? "Dark mode" : "Light mode"}
          className={`flex items-center gap-3 h-10 w-full rounded-full md-label-large text-md-on-surface-variant hover:bg-md-on-surface/8 hover:text-md-on-surface transition-colors duration-200 ease-md-standard ${
            collapsed ? "justify-center" : "px-4"
          }`}
        >
          <Icon
            name={theme === "light" ? "dark_mode" : "light_mode"}
            size={20}
            className="shrink-0"
          />
          {!collapsed && <span>{theme === "light" ? "dark mode" : "light mode"}</span>}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          className={`flex items-center gap-3 h-10 w-full rounded-full md-label-large text-md-on-surface-variant hover:bg-md-error/10 hover:text-md-error transition-colors duration-200 ease-md-standard ${
            collapsed ? "justify-center" : "px-4"
          }`}
        >
          <Icon name="logout" size={20} className="shrink-0" />
          {!collapsed && <span>logout</span>}
        </button>
      </div>
    </aside>
  );
}
