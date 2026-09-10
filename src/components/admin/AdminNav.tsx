"use client";

import NavTree, {
  type TreeFolder,
  type TreePlacement,
} from "@/components/admin/NavTree";
import { useTheme } from "@/components/admin/ThemeProvider";
import { Icon } from "@/components/ui/Icon";
import {
  OUTLINE_EVENT,
  type OutlineItem,
  gotoHeading,
} from "@/lib/admin-events";
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
 * The admin's vertical navigation: a 48px activity rail and a panel beside it.
 *
 * The panel's contents are DERIVED FROM THE ROUTE rather than held in their own
 * state. The first version kept a `view` that some items changed and others did
 * not: clicking Media navigated without touching `view`, so Media lit up from
 * the pathname while Posts stayed lit from `view`, two tabs active at once.
 * Worse, clicking Posts then matched "you clicked the item that is already
 * selected" and collapsed the panel instead of navigating, so the Posts page
 * could not be reached at all. Deriving the panel from the pathname makes that
 * disagreement impossible to express.
 *
 * Outline is the one exception, because it is a view of the document you are
 * already inside rather than a place to go. It is a toggle, and it exists only
 * while a post is open.
 */

export interface NavItem {
  slug: string;
  title: string;
  status?: string;
}

type PanelId = "posts" | "work" | "series" | "outline";

interface Activity {
  id: string;
  icon: string;
  label: string;
  /** Where clicking goes. Absent only for Outline, which goes nowhere. */
  href?: string;
  /** Match the whole path rather than a prefix. */
  exact?: boolean;
  /** Only rendered while a post is open in the editor. */
  editorOnly?: boolean;
  /** Draws a hairline above this item. */
  groupStart?: boolean;
}

const ACTIVITIES: Activity[] = [
  {
    id: "dashboard",
    icon: "home",
    label: "Dashboard",
    href: "/admin",
    exact: true,
  },
  {
    id: "posts",
    icon: "article",
    label: "Posts",
    href: "/admin/posts",
  },
  { id: "work", icon: "widgets", label: "Work", href: "/admin/work" },
  {
    id: "series",
    icon: "folder",
    label: "Collections",
    href: "/admin/projects",
  },
  {
    id: "outline",
    icon: "format_list_bulleted",
    label: "Outline",
    editorOnly: true,
  },
  {
    id: "media",
    icon: "image",
    label: "Media",
    href: "/admin/media",
    groupStart: true,
  },
  {
    id: "categories",
    icon: "label",
    label: "Categories",
    href: "/admin/categories",
  },
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
const MIN_W = 180;
const MAX_W = 460;
const DEFAULT_W = 248;

/** Which list the panel shows on a given route. */
function routePanel(pathname: string): PanelId | null {
  if (pathname.startsWith("/admin/posts")) return "posts";
  if (pathname.startsWith("/admin/work")) return "work";
  if (pathname.startsWith("/admin/projects")) return "series";
  return null;
}

function isOnRoute(pathname: string, a: Activity) {
  if (!a.href) return false;
  return a.exact ? pathname === a.href : pathname.startsWith(a.href);
}

export default function AdminNav({
  posts,
  work,
  series,
  folders,
  placement,
}: {
  posts: NavItem[];
  work: NavItem[];
  series: NavItem[];
  folders: TreeFolder[];
  placement: TreePlacement[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();

  const inPostEditor = /^\/admin\/posts\/(new|[^/]+\/edit)$/.test(pathname);

  const [showOutline, setShowOutline] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(DEFAULT_W);
  const [filter, setFilter] = useState("");
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [dragging, setDragging] = useState(false);

  const panel: PanelId | null =
    showOutline && inPostEditor ? "outline" : routePanel(pathname);

  // Read the persisted layout before paint so the panel does not jump width.
  useLayoutEffect(() => {
    try {
      const w = Number(localStorage.getItem(W_KEY));
      if (w >= MIN_W && w <= MAX_W) setWidth(w);
      setCollapsed(localStorage.getItem(C_KEY) === "true");
    } catch {}
  }, []);

  useEffect(() => {
    const onOutline = (e: Event) =>
      setOutline((e as CustomEvent<OutlineItem[]>).detail ?? []);
    window.addEventListener(OUTLINE_EVENT, onOutline);
    return () => window.removeEventListener(OUTLINE_EVENT, onOutline);
  }, []);

  // Leaving the editor drops the outline and the toggle that shows it.
  useEffect(() => {
    if (!inPostEditor) {
      setOutline([]);
      setShowOutline(false);
    }
  }, [inPostEditor]);

  // A filter belongs to the list it was typed into.
  // biome-ignore lint/correctness/useExhaustiveDependencies: clears on panel change
  useEffect(() => {
    setFilter("");
  }, [panel]);

  const persist = useCallback((k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  }, []);

  const select = useCallback(
    (a: Activity) => {
      if (a.id === "outline") {
        setShowOutline((s) => !s);
        setCollapsed(false);
        persist(C_KEY, "false");
        return;
      }
      // Clicking the place you are already in collapses the panel, which is
      // what a rail like this does everywhere else. Clicking anywhere else
      // navigates, always.
      if (isOnRoute(pathname, a)) {
        setShowOutline(false);
        setCollapsed((c) => {
          persist(C_KEY, String(!c));
          return !c;
        });
        return;
      }
      setShowOutline(false);
      setCollapsed(false);
      persist(C_KEY, "false");
      if (a.href) router.push(a.href);
    },
    [pathname, persist, router],
  );

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      persist(C_KEY, String(!c));
      return !c;
    });
  }, [persist]);

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

  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setDragging(true);
      const startX = e.clientX;
      const startW = width;
      const move = (ev: PointerEvent) =>
        setWidth(
          Math.min(MAX_W, Math.max(MIN_W, startW + (ev.clientX - startX))),
        );
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

  const activities = ACTIVITIES.filter((a) => !a.editorOnly || inPostEditor);

  const items = useMemo(() => {
    const list = panel === "work" ? work : panel === "series" ? series : posts;
    const q = filter.trim().toLowerCase();
    return q ? list.filter((i) => i.title.toLowerCase().includes(q)) : list;
  }, [panel, posts, work, series, filter]);

  const activeFor = (a: Activity) =>
    a.id === "outline" ? panel === "outline" : isOnRoute(pathname, a);

  // ---- the travelling indicator -------------------------------------------
  //
  // One element that moves, rather than one per item appearing and vanishing.
  // A marker that fades out here and in over there tells you the selection
  // changed; a marker that travels tells you WHERE it went, and the eye
  // follows it instead of re-scanning the column.
  //
  // Position is measured from the real buttons rather than computed from a row
  // height, because the group separators make the rows unevenly spaced.
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [marker, setMarker] = useState<{ top: number; height: number } | null>(
    null,
  );
  const [travelling, setTravelling] = useState(false);
  const lastTop = useRef<number | null>(null);

  const activeId = activities.find((a) => activeFor(a))?.id ?? null;

  // Measure after layout, and only write state when a number actually changed.
  // Writing a fresh object every pass is a render loop: the effect has no
  // dependency list on purpose, so an unconditional setState re-runs it for
  // ever, React hits its update ceiling and the marker never paints at all.
  useLayoutEffect(() => {
    const measure = () => {
      const el = activeId ? itemRefs.current.get(activeId) : null;
      const list = listRef.current;
      if (!el || !list) {
        setMarker((m) => (m === null ? m : null));
        lastTop.current = null;
        return;
      }
      const a = el.getBoundingClientRect();
      const b = list.getBoundingClientRect();
      const top = Math.round(a.top - b.top);
      const height = Math.round(a.height);

      const moved =
        lastTop.current !== null && Math.abs(top - lastTop.current) > 2;
      lastTop.current = top;
      setMarker((m) =>
        m && m.top === top && m.height === height ? m : { top, height },
      );
      if (moved) setTravelling(true);
    };

    measure();
    // The rail's rows shift when the Outline item appears or disappears, and
    // when the window changes height.
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeId, activities.length]);

  // The stretch lasts exactly as long as the travel.
  useEffect(() => {
    if (!travelling) return;
    const t = setTimeout(() => setTravelling(false), 260);
    return () => clearTimeout(t);
  }, [travelling]);

  const panelWidth = panel && !collapsed ? width : 0;

  return (
    <div className="admin-nav flex h-screen shrink-0">
      {/* ---------- activity rail ---------- */}
      <div className="w-12 shrink-0 h-full flex flex-col items-center border-r border-md-outline-variant bg-md-surface-container-lowest">
        {/* A link back to the site, without the initial. A single letter at the
            top of a rail is a logo slot, and this is one person's own CMS: it
            was labelling the thing to its owner. */}
        <Link
          href="/"
          title="View site"
          aria-label="View site"
          className="h-11 w-full grid place-items-center text-md-on-surface-variant hover:text-md-on-surface transition-colors duration-fast"
        >
          <span className="grid place-items-center w-8 h-8 rounded-[10px] hover:bg-md-on-surface/6 transition-colors duration-fast">
            <Icon name="open_in_new" size={16} />
          </span>
        </Link>

        <div ref={listRef} className="relative flex-1 w-full pt-1">
          {/* The marker sits behind the buttons and slides between them. */}
          {marker && (
            <span
              aria-hidden
              className={`rail-marker ${travelling ? "is-travelling" : ""}`}
              style={{
                transform: `translateY(${marker.top}px)`,
                height: marker.height,
              }}
            >
              <span className="rail-marker__bar" />
              <span className="rail-marker__pill" />
            </span>
          )}

          {activities.map((a) => {
            const on = activeFor(a);
            return (
              <div key={a.id} className="w-full">
                {a.groupStart && (
                  <div className="my-1.5 mx-3 border-t border-md-outline-variant" />
                )}
                <button
                  type="button"
                  ref={(el) => {
                    if (el) itemRefs.current.set(a.id, el);
                    else itemRefs.current.delete(a.id);
                  }}
                  onClick={() => select(a)}
                  aria-label={a.label}
                  aria-current={on ? "page" : undefined}
                  className={`rail-item ${on ? "is-on" : ""}`}
                >
                  <span className="rail-item__icon">
                    <Icon name={a.icon} size={18} filled={on} />
                  </span>
                  {/* A real label instead of the browser's tooltip: it arrives
                      fast enough to be useful and slow enough that sweeping
                      the pointer down the rail does not fire all of them. */}
                  <span className="rail-tip">{a.label}</span>
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={toggle}
          title={theme === "dark" ? "Switch to light" : "Switch to dark"}
          aria-label="Toggle theme"
          className="w-full h-10 grid place-items-center text-md-on-surface-variant hover:text-md-on-surface transition-colors duration-fast"
        >
          <Icon
            name={theme === "dark" ? "dark_mode" : "light_mode"}
            size={18}
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
          className="w-full h-10 mb-1 grid place-items-center text-md-on-surface-variant hover:text-md-error transition-colors duration-fast"
        >
          <span className="grid place-items-center w-8 h-8 rounded-[10px] hover:bg-md-error/12 transition-colors duration-fast">
            <Icon name="logout" size={18} />
          </span>
        </button>
      </div>

      {/* ---------- contextual panel ---------- */}
      <div
        style={{ width: panelWidth }}
        className={`relative h-full shrink-0 overflow-hidden bg-md-surface-container-low ${
          panelWidth ? "border-r border-md-outline-variant" : ""
        } ${dragging ? "" : "transition-[width] duration-moderate ease-md-standard"}`}
      >
        <div style={{ width }} className="h-full flex flex-col">
          {panel === "outline" ? (
            <OutlinePanel outline={outline} />
          ) : (
            <ListPanel
              panel={panel}
              items={items}
              allCount={
                panel === "work"
                  ? work.length
                  : panel === "series"
                    ? series.length
                    : posts.length
              }
              folders={folders}
              placement={placement}
              filter={filter}
              setFilter={setFilter}
              pathname={pathname}
            />
          )}
        </div>

        {panelWidth > 0 && (
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
    <div className="h-12 shrink-0 flex items-center gap-2 px-3 border-b border-md-outline-variant/60">
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

function OutlinePanel({ outline }: { outline: OutlineItem[] }) {
  return (
    <>
      <PanelHead title="Outline" count={outline.length} />
      <div className="flex-1 overflow-y-auto pb-4">
        {outline.length === 0 ? (
          <p className="px-3 py-2 text-[12.5px] leading-5 text-md-on-surface-variant">
            No headings yet.
          </p>
        ) : (
          outline.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => gotoHeading(h.id)}
              className="w-full text-left pr-3 py-1 text-[12.5px] leading-5 text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-on-surface/8 truncate transition-colors duration-fast"
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

const PANEL_META: Record<
  "posts" | "work" | "series",
  { title: string; base: string; add: string; newLabel: string }
> = {
  posts: {
    title: "Posts",
    base: "/admin/posts",
    add: "/admin/posts/new",
    newLabel: "New post",
  },
  work: {
    title: "Work",
    base: "/admin/work",
    add: "/admin/work/new",
    newLabel: "New work item",
  },
  series: {
    title: "Collections",
    base: "/admin/projects",
    add: "/admin/projects/new",
    newLabel: "New collection",
  },
};

function ListPanel({
  panel,
  items,
  allCount,
  folders,
  placement,
  filter,
  setFilter,
  pathname,
}: {
  panel: PanelId | null;
  items: NavItem[];
  allCount: number;
  folders: TreeFolder[];
  placement: TreePlacement[];
  filter: string;
  setFilter: (v: string) => void;
  pathname: string;
}) {
  if (!panel || panel === "outline") return null;
  const meta = PANEL_META[panel];
  const scopeFolders = folders.filter((f) => f.scope === panel);
  const scopePlacement = placement.filter((p) => p.scope === panel);

  return (
    <>
      <PanelHead
        title={meta.title}
        count={allCount}
        action={
          <Link
            href={meta.add}
            title={meta.newLabel}
            className="p-1 rounded text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-on-surface/8 transition-colors duration-fast"
          >
            <Icon name="add" size={16} />
          </Link>
        }
      />

      <div className="px-2 pt-2 pb-1.5">
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-md-on-surface-variant pointer-events-none">
            <Icon name="search" size={14} />
          </span>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setFilter("");
            }}
            placeholder="Filter"
            aria-label={`Filter ${meta.title}`}
            className="w-full h-8 pl-7 pr-2 rounded-lg bg-md-surface-container-high border border-md-outline-variant text-[12.5px] text-md-on-surface placeholder:text-md-on-surface-variant/70 focus:outline-none focus:border-md-outline transition-colors duration-fast"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <NavTree
          scope={panel}
          base={meta.base}
          items={items}
          folders={scopeFolders}
          placement={scopePlacement}
          pathname={pathname}
          filter={filter}
        />
      </div>
    </>
  );
}
