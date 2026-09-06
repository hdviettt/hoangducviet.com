"use client";

import AdminRow, { adminDate } from "@/components/admin/AdminRow";
import DeleteButton from "@/components/admin/DeleteButton";
import StatusToggle from "@/components/admin/StatusToggle";
import { useRef, useState } from "react";

export interface WorkListItem {
  slug: string;
  title: string;
  description: string | null;
  status: string;
  buildStatus: string;
  featured: boolean;
  dateCreated: string | null;
  links: number;
}

// Six dots. Inline rather than an icon-font ligature, because a grip that
// renders as the word "drag_indicator" until a font arrives is worse than no
// grip at all.
function Grip() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px] fill-current"
      aria-hidden="true"
    >
      <circle cx="9" cy="6" r="1.6" />
      <circle cx="15" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" />
      <circle cx="15" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" />
      <circle cx="15" cy="18" r="1.6" />
    </svg>
  );
}

function reorder(list: WorkListItem[], from: number, to: number) {
  const next = list.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/**
 * The Work list, reorderable by dragging a row.
 *
 * Sort order used to be a number you typed into each project's edit form, so
 * moving one project meant editing every project it displaced. Here the list
 * itself is the control: drag a row (or focus its grip and press the arrow
 * keys) and the new order is written for every row at once.
 *
 * The order is applied optimistically and reverted if the save fails, because
 * a list that snaps back to the server's truth is honest, while one that keeps
 * showing an order the database never accepted is not.
 */
export default function WorkList({ items }: { items: WorkListItem[] }) {
  const [rows, setRowsState] = useState(items);
  const [dragging, setDraggingState] = useState<string | null>(null);
  // Drag handlers fire faster than React re-renders: a dragover can arrive in
  // the same task as the dragstart that preceded it, and the handler would
  // then read the `dragging` and `rows` of the render it was created in, which
  // is still the state from before the drag began. The refs are what the
  // handlers read; the state exists only so the list repaints.
  const rowsRef = useRef(items);
  const draggingRef = useRef<string | null>(null);

  function setRows(next: WorkListItem[]) {
    rowsRef.current = next;
    setRowsState(next);
  }
  function setDragging(slug: string | null) {
    draggingRef.current = slug;
    setDraggingState(slug);
  }
  const [armed, setArmed] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  // The last order the server accepted, to fall back to when a save fails.
  const committed = useRef(items);

  async function save(next: WorkListItem[]) {
    setState("saving");
    try {
      const res = await fetch("/api/work/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: next.map((r) => r.slug) }),
      });
      if (!res.ok) throw new Error(String(res.status));
      committed.current = next;
      setState("saved");
    } catch {
      setRows(committed.current);
      setState("error");
    }
  }

  function moveBy(slug: string, delta: number) {
    const current = rowsRef.current;
    const from = current.findIndex((r) => r.slug === slug);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= current.length) return;
    const next = reorder(current, from, to);
    setRows(next);
    save(next);
  }

  const status =
    state === "saving"
      ? "Saving order…"
      : state === "saved"
        ? "Order saved"
        : state === "error"
          ? "Could not save the order — it has been put back"
          : "Drag a row to reorder, or focus a grip and use the arrow keys";

  return (
    <div>
      <p
        className={`mb-3 text-[13px] leading-5 ${
          state === "error" ? "text-md-error" : "text-md-on-surface-variant"
        }`}
        aria-live="polite"
      >
        {status}
      </p>

      <div className="border-t border-md-outline-variant stagger-list">
        {rows.map((p, index) => {
          const isDraft = p.status !== "published";
          return (
            <div
              key={p.slug}
              data-slug={p.slug}
              draggable={armed === p.slug}
              onDragStart={(e) => {
                setDragging(p.slug);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", p.slug);
              }}
              onDragEnd={() => {
                setDragging(null);
                setArmed(null);
                if (rowsRef.current !== committed.current)
                  save(rowsRef.current);
              }}
              onDragOver={(e) => {
                const held = draggingRef.current;
                if (!held || held === p.slug) return;
                // Reorder as the pointer passes each row, so the list shows
                // where the row will land instead of a drop indicator that has
                // to be interpreted.
                e.preventDefault();
                const current = rowsRef.current;
                const from = current.findIndex((r) => r.slug === held);
                if (from >= 0 && from !== index)
                  setRows(reorder(current, from, index));
              }}
              className={`relative flex items-start gap-1 transition-opacity ${
                dragging === p.slug ? "opacity-40" : "opacity-100"
              }`}
            >
              <button
                type="button"
                aria-label={`Move ${p.title}`}
                title="Drag to reorder, or use the arrow keys"
                onMouseDown={() => setArmed(p.slug)}
                onMouseUp={() => setArmed(null)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    moveBy(p.slug, -1);
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    moveBy(p.slug, 1);
                  }
                }}
                className="mt-7 shrink-0 cursor-grab rounded-md p-1 text-md-outline transition-colors hover:text-md-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-md-primary active:cursor-grabbing"
              >
                <Grip />
              </button>

              <div className="min-w-0 flex-1">
                <AdminRow
                  href={`/admin/work/${p.slug}/edit`}
                  title={p.title}
                  description={p.description}
                  muted={isDraft}
                  meta={
                    <>
                      <span className="tabular-nums">#{index + 1}</span>
                      <span>{p.buildStatus}</span>
                      <span>
                        {p.links} {p.links === 1 ? "link" : "links"}
                      </span>
                      {p.featured && (
                        <span className="text-md-primary">Featured</span>
                      )}
                      {isDraft && <span>Draft</span>}
                      <span className="tabular-nums">
                        {adminDate(p.dateCreated)}
                      </span>
                    </>
                  }
                  actions={
                    <>
                      <StatusToggle
                        slug={p.slug}
                        status={p.status}
                        apiPath="work"
                      />
                      <DeleteButton
                        slug={p.slug}
                        name={p.title}
                        apiPath="work"
                      />
                    </>
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
