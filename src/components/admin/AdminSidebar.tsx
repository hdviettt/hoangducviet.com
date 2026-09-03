"use client";

import { Icon } from "@/components/ui/Icon";
import { IDENTITY } from "@/lib/identity";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Text, not chrome. The reader-facing nav is four words in a row with no
// icons, no backgrounds and no chips — the current page is simply the one set
// in medium. This rail does the same thing vertically: words at 15px, an
// accent rule at the edge for the current page, and hairlines instead of
// grey group headings. Icons survive only in the collapsed state, where a
// 56px rail has room for nothing else.

const navSections = [
  [
    { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
    { href: "/admin/posts", label: "Posts", icon: "description" },
    { href: "/admin/work", label: "Work", icon: "widgets" },
    { href: "/admin/projects", label: "Series", icon: "folder" },
    { href: "/admin/categories", label: "Categories", icon: "label" },
  ],
  [{ href: "/admin/media", label: "Media", icon: "image" }],
  [
    { href: "/admin/internal-links", label: "Internal links", icon: "link" },
    { href: "/admin/settings", label: "Settings", icon: "settings" },
  ],
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

  return (
    <aside
      className={`relative bg-md-background border-r border-md-outline-variant h-screen flex flex-col shrink-0 transition-[width] duration-200 ease-md-standard ${
        collapsed ? "w-14" : "w-[232px]"
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

      <div className="h-16 flex items-center shrink-0 px-5">
        {collapsed ? (
          <Link
            href="/"
            title="View site"
            className="mx-auto text-[15px] font-medium tracking-tight text-md-on-surface hover:text-md-primary transition-colors duration-200 ease-md-standard"
          >
            {IDENTITY.name.charAt(0)}
          </Link>
        ) : (
          <div className="min-w-0">
            <Link
              href="/"
              title="View site"
              className="block text-[17px] leading-6 font-medium tracking-tight text-md-on-surface whitespace-nowrap hover:text-md-primary transition-colors duration-200 ease-md-standard"
            >
              {IDENTITY.name}
            </Link>
          </div>
        )}
      </div>

      {/* overflow-x-hidden: the active rule sits at the rail's true left edge,
          so the rows run the full width and must not be able to scroll. */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 pt-2">
        {navSections.map((group, gi) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed, ordered groups
          <div key={gi}>
            {gi > 0 && (
              <div className="my-3 mx-5 border-t border-md-outline-variant" />
            )}
            {group.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`relative flex items-center h-9 text-[15px] leading-6 transition-colors duration-200 ease-md-standard ${
                    collapsed ? "justify-center" : "px-5"
                  } ${
                    active
                      ? "text-md-on-surface font-medium"
                      : "text-md-on-surface-variant hover:text-md-on-surface"
                  }`}
                >
                  {/* The whole marker for "you are here": a rule at the rail's
                      edge. No fill, no pill, nothing the site does not own. */}
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-md-primary" />
                  )}
                  {collapsed ? (
                    <Icon name={item.icon} size={20} filled={active} />
                  ) : (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-md-outline-variant py-3 px-5">
        <button
          type="button"
          onClick={handleLogout}
          title="Log out"
          className={`flex items-center h-9 w-full text-[15px] leading-6 text-md-on-surface-variant hover:text-md-error transition-colors duration-200 ease-md-standard ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {collapsed ? <Icon name="logout" size={20} /> : <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}
