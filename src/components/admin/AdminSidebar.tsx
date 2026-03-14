"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/layout/ThemeProvider";
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Tags,
  Image,
  Settings,
  LogOut,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "posts", icon: FileText },
  { href: "/admin/projects", label: "projects", icon: FolderKanban },
  { href: "/admin/categories", label: "categories", icon: Tags },
  { href: "/admin/media", label: "media", icon: Image },
  { href: "/admin/settings", label: "settings", icon: Settings },
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
      className={`border-r border-border bg-card min-h-screen py-4 flex flex-col shrink-0 transition-all duration-200 ${
        collapsed ? "w-14 px-1.5" : "w-48 px-3"
      }`}
    >
      {/* Header */}
      <div className={`mb-6 ${collapsed ? "px-1" : "px-3"}`}>
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5"
          title="Back to site"
        >
          <ExternalLink className="w-3 h-3 shrink-0" />
          {!collapsed && <span>site</span>}
        </Link>
        {!collapsed && (
          <div className="text-sm text-primary font-medium mt-2">admin</div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-px">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-2.5 py-1.5 text-sm transition-colors ${
                collapsed ? "justify-center px-1" : "px-3"
              } ${
                isActive
                  ? "text-primary border-l-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className={`space-y-1 mt-4 ${collapsed ? "px-1" : ""}`}>
        {/* Dark mode toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === "light" ? "Dark mode" : "Light mode"}
          className={`flex items-center gap-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-full ${
            collapsed ? "justify-center px-1" : "px-3"
          }`}
        >
          {theme === "light" ? (
            <Moon className="w-4 h-4 shrink-0" />
          ) : (
            <Sun className="w-4 h-4 shrink-0" />
          )}
          {!collapsed && <span>{theme === "light" ? "dark mode" : "light mode"}</span>}
        </button>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={toggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`flex items-center gap-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-full ${
            collapsed ? "justify-center px-1" : "px-3"
          }`}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4 shrink-0" />
          ) : (
            <PanelLeftClose className="w-4 h-4 shrink-0" />
          )}
          {!collapsed && <span>collapse</span>}
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          className={`flex items-center gap-2.5 py-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors w-full ${
            collapsed ? "justify-center px-1" : "px-3"
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>logout</span>}
        </button>
      </div>
    </aside>
  );
}
