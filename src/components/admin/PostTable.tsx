"use client";

import DeleteButton from "@/components/admin/DeleteButton";
import StatusToggle from "@/components/admin/StatusToggle";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * A dense, keyboard-driven list.
 *
 * The rows it replaces were 119px tall with a two-line description, which put
 * 7.5 of 28 posts on a screen and gave the page no input element of any kind:
 * no search, no filter, no sort. Finding a post meant scrolling and reading.
 *
 * At 36px a row, the same 28 posts fit in one screen. The description is gone
 * because it is the one field you can already read on the site, and the
 * per-row "No cover" warnings are gone because repeating a warning on ten rows
 * says less than counting it once in the header.
 */

export interface PostRow {
  slug: string;
  title: string;
  status: string;
  description: string | null;
  thumbnail: string | null;
  dateCreated: Date | string | null;
  dateUpdated: Date | string | null;
}

type SortKey = "updated" | "created" | "title";

function when(v: Date | string | null): number {
  if (!v) return 0;
  const d = typeof v === "string" ? new Date(v) : v;
  const n = d.getTime();
  return Number.isNaN(n) ? 0 : n;
}

function shortDate(v: Date | string | null): string {
  const t = when(v);
  if (!t) return "—";
  return new Date(t).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

export default function PostTable({ rows }: { rows: PostRow[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("updated");
  const [cursor, setCursor] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const out = rows.filter(
      (r) =>
        !term ||
        r.title.toLowerCase().includes(term) ||
        r.slug.toLowerCase().includes(term),
    );
    out.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "created") return when(b.dateCreated) - when(a.dateCreated);
      return (
        when(b.dateUpdated) - when(a.dateUpdated) ||
        when(b.dateCreated) - when(a.dateCreated)
      );
    });
    return out;
  }, [rows, q, sort]);

  // Keep the cursor inside the list when the filter shortens it.
  useEffect(() => {
    setCursor((c) => Math.min(c, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const typing =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable);

      // Bare keys work in the chrome, never while typing. This is Linear's
      // split, and it is the only one that survives a page with a text field.
      if (typing) {
        if (e.key === "Escape") {
          (el as HTMLInputElement).blur();
          if (el === searchRef.current) setQ("");
        }
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(filtered.length - 1, c + 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(0, c - 1));
      } else if (e.key === "Enter") {
        const row = filtered[cursor];
        if (row) router.push(`/admin/posts/${row.slug}/edit`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, cursor, router]);

  // Follow the cursor without yanking the whole page around.
  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-i="${cursor}"]`,
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const drafts = rows.filter((r) => r.status !== "published").length;
  const noCover = rows.filter((r) => !r.thumbnail).length;
  const noDesc = rows.filter((r) => !r.description).length;

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-1">
        <h1 className="text-[26px] leading-8 font-medium tracking-tight">
          Posts
        </h1>
        <span className="font-mono text-[13px] tabular-nums text-md-on-surface-variant">
          {filtered.length === rows.length
            ? rows.length
            : `${filtered.length}/${rows.length}`}
        </span>
        <Link
          href="/admin/posts/new"
          className="ml-auto md-btn md-btn-filled md-btn-sm"
        >
          <span>New post</span>
          <kbd className="font-sans text-[12px] rounded bg-md-on-primary/20 px-1.5 leading-none py-0.5">
            N
          </kbd>
        </Link>
      </div>

      {/* One counted line instead of a warning repeated down the page. */}
      <p className="mb-5 text-[13px] leading-5 text-md-on-surface-variant">
        {drafts} draft{drafts === 1 ? "" : "s"}
        {noCover > 0 && <>, {noCover} without a cover</>}
        {noDesc > 0 && <>, {noDesc} without a description</>}
      </p>

      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1 max-w-[360px]">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-md-on-surface-variant pointer-events-none">
            <Icon name="search" size={15} />
          </span>
          <input
            ref={searchRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter posts"
            aria-label="Filter posts"
            className="w-full h-8 pl-8 pr-8 rounded-lg bg-md-surface-container-low border border-md-outline-variant text-[13px] text-md-on-surface placeholder:text-md-on-surface-variant/70 focus:outline-none focus:border-md-outline transition-colors duration-fast"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[11px] text-md-on-surface-variant/70 pointer-events-none">
            /
          </kbd>
        </div>

        <div className="flex items-center rounded-lg border border-md-outline-variant overflow-hidden">
          {(
            [
              ["updated", "Updated"],
              ["created", "Created"],
              ["title", "A-Z"],
            ] as Array<[SortKey, string]>
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setSort(k)}
              className={`px-2.5 h-8 text-[12px] transition-colors duration-fast ${
                sort === k
                  ? "bg-md-secondary-container text-md-on-secondary-container"
                  : "text-md-on-surface-variant hover:bg-md-on-surface/8"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <span className="ml-auto font-mono text-[11px] text-md-on-surface-variant/70 hidden sm:block">
          J K move · Enter open
        </span>
      </div>

      <ul ref={listRef} className="border-t border-md-outline-variant">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-[13px] text-md-on-surface-variant">
            Nothing matches “{q}”.
          </p>
        )}
        {filtered.map((row, i) => {
          const draft = row.status !== "published";
          const on = i === cursor;
          return (
            <li
              key={row.slug}
              data-i={i}
              onMouseEnter={() => setCursor(i)}
              className={`group relative flex items-center gap-3 h-9 px-3 border-b border-md-outline-variant transition-colors duration-fast ${
                on ? "bg-md-on-surface/8" : ""
              }`}
            >
              {on && (
                <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-md-primary" />
              )}
              <span
                title={row.status}
                aria-label={row.status}
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  draft ? "bg-md-on-surface-variant/50" : "bg-md-primary"
                }`}
              />
              <Link
                href={`/admin/posts/${row.slug}/edit`}
                className={`min-w-0 flex-1 truncate text-[13.5px] ${
                  draft ? "text-md-on-surface-variant" : "text-md-on-surface"
                } hover:text-md-primary transition-colors duration-fast`}
                title={row.title}
              >
                {row.title}
              </Link>

              {!row.thumbnail && (
                <span
                  title="No cover"
                  className="shrink-0 text-md-warning opacity-70"
                >
                  <Icon name="image" size={14} />
                </span>
              )}
              {!row.description && (
                <span
                  title="No description"
                  className="shrink-0 text-md-warning opacity-70"
                >
                  <Icon name="description" size={14} />
                </span>
              )}

              <span className="shrink-0 w-[76px] text-right font-mono text-[11.5px] tabular-nums text-md-on-surface-variant">
                {shortDate(row.dateUpdated ?? row.dateCreated)}
              </span>

              {/* Row actions stay out of the way until the row is the one you
                  are on, so a list of 28 does not carry 56 buttons. */}
              <span
                className={`shrink-0 flex items-center gap-1 transition-opacity duration-fast ${
                  on ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <StatusToggle
                  slug={row.slug}
                  status={row.status}
                  apiPath="posts"
                />
                <DeleteButton
                  slug={row.slug}
                  name={row.title}
                  apiPath="posts"
                  compact
                />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
