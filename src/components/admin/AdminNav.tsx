"use client";

import { useTheme } from "@/components/admin/ThemeProvider";
import { Icon } from "@/components/ui/Icon";
import {
  OUTLINE_EVENT,
  type OutlineItem,
  gotoHeading,
} from "@/lib/admin-events";
import { IDENTITY } from "@/lib/identity";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * The admin's vertical navigation, in two parts.
 *
 * A 48px activity rail (VS Code's own width) that never moves, and a panel
 * beside it whose contents depend on which activity is selected. Clicking the
 * already-active icon collapses the panel, which is the behaviour VS Code has
 * and the one people expect from a rail like this.
 *
 * The panel is a real drag-resizable dock, 180 to 460px, and both the width
 * and the collapsed state persist. Everything animates on the panel's width
 * only, at 240ms, and never on anything in the typing path.
 *
 * The Outline activity is the one that is not a copy of an existing app: it
 * lists the headings of the post currently open in the editor, published by
 * the editor through a window event, so a 2,500-word draft becomes navigable
 * without scrolling. It only appears while a post is open.
 */

export interface NavPost {
  slug: string;
  title: string;
  status: string;
}
export interface NavSeries {
  slug: string;
  title: string;
}

type ViewId = "posts" | "series" | "outline" | "media" | "links" | "settings";

interface Activity {
  id: ViewId;
  icon: string;
  label: string;
  /** Activities that are a plain destination rather than a panel view. */
  href?: string;
}

const ACTIVITIES: Activity[] = [
  { id: "posts", icon: "description", label: "Posts" },
  { id: "series", icon: "folder", label: "Collections" },
  { id: "outline", icon: "format_list_bulleted", label: "Outline" },
  { id: "media", icon: "image", label: "Media", href: "/admin/media" },
  {
    id: "links",
    icon: "link",
    label: "Internal links",
    href: "/admin/internal-links",
  },
  {
    id: "settings",
    icon: "settings",
    label: "Settings",
    href: "/admin/settings",
  },
];

const W_KEY = "admin-nav-width";
const C_KEY = "admin-nav-collapsed";
const V_KEY = "admin-nav-view";
const MIN_W = 180;
const MAX_W = 460;
const DEFAULT_W = 248;

export default function AdminNav({
  posts,
  series,
}: {
  posts: NavPost[];
  series: NavSeries[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();

  const editingSlug = useMemo(() => {
    const m = /^\/admin\/posts\/([^/]+)\/edit$/.exec(pathname);
    return m ? m[1] : null;
  }, [pathname]);

  const [view, setView] = useState<ViewId>("posts");
  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(DEFAULT_W);
  const [filter, setFilter] = useState("");
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const filterRef = useRef<HTMLInputElement>(null);

  // Read persisted layout before the browser paints, so the panel does not
  // visibly jump from the default width to the stored one on every load.
  useLayoutEffect(() => {
    try {
      const w = Number(localStorage.getItem(W_KEY));
      if (w >= MIN_W && w <= MAX_W) setWidth(w);
      setCollapsed(localStorage.getItem(C_KEY) === "true");
      const v = localStorage.getItem(V_KEY) as ViewId | null;
      if (v) setView(v);
    } catch {}
  }, []);

  useEffect(() => {
    const onOutline = (e: Event) => {
      setOutline((e as CustomEvent<OutlineItem[]>).detail ?? []);
    };
    window.addEventListener(OUTLINE_EVENT, onOutline);
    return () => window.removeEventListener(OUTLINE_EVENT, onOutline);
  }, []);

  // An outline belongs to one document; leaving the editor must clear it.
  useEffect(() => {
    if (!editingSlug) setOutline([]);
  }, [editingSlug]);

  const persist = useCallback((k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  }, []);

  const selectActivity = useCallback(
    (a: Activity) => {
      if (a.href) {
        router.push(a.href);
        return;
      }
      // Clicking the active icon collapses, which is what VS Code does.
      if (a.id === view && !collapsed) {
        setCollapsed(true);
        persist(C_KEY, "true");
        return;
      }
      setView(a.id);
      setCollapsed(false);
      persist(V_KEY, a.id);
      persist(C_KEY, "false");
    },
    [view, collapsed, persist, router],
  );

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      persist(C_KEY, String(!c));
      return !c;
    });
  }, [persist]);

  // Cmd/Ctrl+B collapses, matching every editor that has this rail.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleCollapsed]);

  // Drag to resize. Pointer events on the window rather than the handle, so a
  // fast drag that outruns the 4px grip does not drop the gesture.
  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setDragging(true);
      const startX = e.clientX;
      const startW = width;
      const move = (ev: PointerEvent) => {
        const next = Math.min(
          MAX_W,
          Math.max(MIN_W, startW + (ev.clientX - startX)),
        );
        setWidth(next);
      };
      const up = () => {
        setDragging(false);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        setWidth((w) => {
          persist(W_KEY, String(w));
          return w;
        });
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [width, persist],
  );

  const activities = ACTIVITIES.filter(
    (a) => a.id !== "outline" || editingSlug,
  );

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const list = view === "series" ? series : posts;
    if (!q) return list;
    return list.filter((i) => i.title.toLowerCase().includes(q));
  }, [filter, posts, series, view]);

  const activeFor = (a: Activity) => {
    if (a.href) return pathname.startsWith(a.href);
    if (collapsed) return false;
    return a.id === view;
  };

  const panelWidth = collapsed ? 0 : width;

  return (
    <div className="admin-nav flex h-screen shrink-0">
      {/* ---------- activity rail ---------- */}
      <div className="w-12 shrink-0 h-full flex flex-col items-center border-r border-md-outline-variant bg-md-surface-container-low">
        <Link
          href="/"
          title="View site"
          className="h-12 w-full grid place-items-center text-[15px] font-medium text-md-on-surface hover:text-md-primary transition-colors duration-fast"
        >
          {IDENTITY.name.charAt(0)}
        </Link>

        <div className="flex-1 w-full flex flex-col items-center gap-0.5 pt-1">
          {activities.map((a) => {
            const on = activeFor(a);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => selectActivity(a)}
                title={a.label}
                aria-label={a.label}
                aria-pressed={on}
                className={`relative w-full h-11 grid place-items-center transition-colors duration-fast ${
                  on
                    ? "text-md-primary"
                    : "text-md-on-surface-variant hover:text-md-on-surface"
                }`}
              >
                {on && (
                  <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-md-primary" />
                )}
                <Icon name={a.icon} size={20} filled={on} />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={toggle}
          title={theme === "dark" ? "Switch to light" : "Switch to dark"}
          aria-label="Toggle theme"
          className="w-full h-11 grid place-items-center text-md-on-surface-variant hover:text-md-on-surface transition-colors duration-fast"
        >
          <Icon
            name={theme === "dark" ? "dark_mode" : "light_mode"}
            size={19}
          />
        </button>
        <button
          type="button"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/admin/login";
          }}
          title="Log out"
          aria-label="Log out"
          className="w-full h-11 mb-1 grid place-items-center text-md-on-surface-variant hover:text-md-error transition-colors duration-fast"
        >
          <Icon name="logout" size={19} />
        </button>
      </div>

      {/* ---------- contextual panel ---------- */}
      <div
        style={{ width: panelWidth }}
        className={`relative h-full shrink-0 overflow-hidden border-r border-md-outline-variant bg-md-surface-container-low ${
          dragging
            ? ""
            : "transition-[width] duration-moderate ease-md-standard"
        }`}
      >
        <div style={{ width }} className="h-full flex flex-col">
          <PanelBody
            view={view}
            editingSlug={editingSlug}
            filter={filter}
            setFilter={setFilter}
            filterRef={filterRef}
            items={filtered}
            outline={outline}
            pathname={pathname}
          />
        </div>

        {!collapsed && (
          <button
            type="button"
            aria-label="Resize panel"
            onPointerDown={startDrag}
            onDoubleClick={() => {
              setWidth(DEFAULT_W);
              persist(W_KEY, String(DEFAULT_W));
            }}
            className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-md-primary/40 active:bg-md-primary/60 transition-colors duration-fast"
          />
        )}
      </div>
    </div>
  );
}

function PanelBody({
  view,
  editingSlug,
  filter,
  setFilter,
  filterRef,
  items,
  outline,
  pathname,
}: {
  view: ViewId;
  editingSlug: string | null;
  filter: string;
  setFilter: (v: string) => void;
  filterRef: React.RefObject<HTMLInputElement>;
  items: Array<NavPost | NavSeries>;
  outline: OutlineItem[];
  pathname: string;
}) {
  if (view === "outline") {
    return (
      <>
        <PanelHead title="Outline" count={outline.length} />
        <div className="flex-1 overflow-y-auto pb-4">
          {outline.length === 0 ? (
            <p className="px-3 py-2 text-[12.5px] leading-5 text-md-on-surface-variant">
              {editingSlug
                ? "No headings yet."
                : "Open a post to see its outline."}
            </p>
          ) : (
            outline.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => gotoHeading(h.id)}
                className="w-full text-left px-3 py-1 text-[12.5px] leading-5 text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-on-surface/8 truncate transition-colors duration-fast"
                style={{ paddingLeft: 12 + (h.level - 1) * 12 }}
                title={h.text}
              >
                {h.text}
              </button>
            ))
          )}
        </div>
      </>
    );
  }

  const isSeries = view === "series";
  const base = isSeries ? "/admin/projects" : "/admin/posts";

  return (
    <>
      <PanelHead
        title={isSeries ? "Collections" : "Posts"}
        count={items.length}
        action={
          <Link
            href={isSeries ? "/admin/projects/new" : "/admin/posts/new"}
            title={isSeries ? "New collection" : "New post"}
            className="p-1 rounded text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-on-surface/8 transition-colors duration-fast"
          >
            <Icon name="add" size={16} />
          </Link>
        }
      />

      <div className="px-2 pb-2">
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-md-on-surface-variant pointer-events-none">
            <Icon name="search" size={14} />
          </span>
          <input
            ref={filterRef}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setFilter("");
            }}
            placeholder="Filter"
            aria-label="Filter list"
            className="w-full h-7 pl-7 pr-2 rounded-md bg-md-surface-container-high border border-md-outline-variant text-[12.5px] text-md-on-surface placeholder:text-md-on-surface-variant/70 focus:outline-none focus:border-md-outline transition-colors duration-fast"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        {items.length === 0 && (
          <p className="px-3 py-2 text-[12.5px] leading-5 text-md-on-surface-variant">
            Nothing matches.
          </p>
        )}
        {items.map((item) => {
          const href = `${base}/${item.slug}/edit`;
          const on = pathname === href;
          const status = (item as NavPost).status;
          return (
            <Link
              key={item.slug}
              href={href}
              title={item.title}
              className={`relative flex items-center gap-2 h-7 px-3 text-[12.5px] leading-5 transition-colors duration-fast ${
                on
                  ? "bg-md-primary/12 text-md-on-surface"
                  : "text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-on-surface/8"
              }`}
            >
              {on && (
                <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-md-primary" />
              )}
              {status && (
                <span
                  aria-hidden
                  title={status}
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    status === "published"
                      ? "bg-md-primary"
                      : "bg-md-on-surface-variant/50"
                  }`}
                />
              )}
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function PanelHead({
  title,
  count,
  action,
}: {
  title: string;
  count: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="h-12 shrink-0 flex items-center gap-2 px-3">
      <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-md-on-surface-variant">
        {title}
      </span>
      <span className="text-[11px] font-mono tabular-nums text-md-on-surface-variant/60">
        {count}
      </span>
      <span className="ml-auto flex items-center">{action}</span>
    </div>
  );
}
