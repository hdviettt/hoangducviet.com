"use client";

import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * A folder tree for one panel of the admin navigation.
 *
 * Folders live only in the CMS. Nothing a reader can reach knows they exist:
 * no route, feed, sitemap or JSON-LD reads `cms_folders`, and a post's URL is
 * the same whichever folder it sits in. They are here so 28 posts can be
 * arranged the way the person writing them thinks about them.
 *
 * An item with no placement row is unfiled and appears at the root, so a post
 * created anywhere shows up without anything having to file it. That is why
 * the tree is assembled from three lists rather than stored as one.
 *
 * Drag and drop follows the rule every file tree uses: the middle of a folder
 * row means "inside", the top and bottom edges of any row mean "before" and
 * "after". Without the edge zones there is no way to express order, and
 * without the middle zone there is no way to nest.
 */

export interface TreeItem {
  slug: string;
  title: string;
  status?: string;
}
export interface TreeFolder {
  id: number;
  scope: string;
  name: string;
  parentId: number | null;
  sortOrder: number;
}
export interface TreePlacement {
  scope: string;
  itemSlug: string;
  folderId: number | null;
  sortOrder: number;
}

type DragRef =
  | { type: "folder"; id: number }
  | { type: "item"; slug: string }
  | null;

type DropZone = "before" | "inside" | "after";

interface DropTarget {
  zone: DropZone;
  /** The row being hovered. */
  ref: Exclude<DragRef, null>;
  /** Which folder the drop would land in. */
  folderId: number | null;
}

const EXPAND_KEY = "admin-tree-expanded";

async function mutate(body: Record<string, unknown>) {
  const res = await fetch("/api/cms-tree", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.ok;
}

export default function NavTree({
  scope,
  base,
  items,
  folders,
  placement,
  pathname,
  filter,
}: {
  scope: "posts" | "work" | "series";
  base: string;
  items: TreeItem[];
  folders: TreeFolder[];
  placement: TreePlacement[];
  pathname: string;
  filter: string;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Set<number>>(() => {
    try {
      const raw = localStorage.getItem(`${EXPAND_KEY}-${scope}`);
      return new Set<number>(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set<number>();
    }
  });
  // The dragged thing lives in a ref as well as in state. State drives the
  // rendering; the ref is what `dragover` and `drop` read, because those fire
  // from the browser and must not depend on a React commit having happened
  // since `dragstart`. Reading state there works in a real drag only because
  // there is always a frame in between.
  const dragRef = useRef<DragRef>(null);
  const targetRef = useRef<DropTarget | null>(null);
  const [drag, setDragState] = useState<DragRef>(null);
  const [target, setTargetState] = useState<DropTarget | null>(null);

  const setDrag = useCallback((v: DragRef) => {
    dragRef.current = v;
    setDragState(v);
  }, []);
  const setTarget = useCallback((v: DropTarget | null) => {
    targetRef.current = v;
    setTargetState(v);
  }, []);
  const [renaming, setRenaming] = useState<number | null>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  // Focus the rename box when it appears. `autoFocus` would do the same and is
  // flagged for taking focus without a user action; here the user just double
  // clicked the row, so an effect says that explicitly.
  useEffect(() => {
    if (renaming == null) return;
    const el = renameRef.current;
    el?.focus();
    el?.select();
  }, [renaming]);

  const placeOf = useMemo(() => {
    const m = new Map<string, TreePlacement>();
    for (const p of placement) m.set(p.itemSlug, p);
    return m;
  }, [placement]);

  const childFolders = useMemo(() => {
    const m = new Map<number | null, TreeFolder[]>();
    for (const f of folders) {
      const key = f.parentId ?? null;
      if (!m.has(key)) m.set(key, []);
      m.get(key)?.push(f);
    }
    for (const list of m.values()) {
      list.sort(
        (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
      );
    }
    return m;
  }, [folders]);

  const q = filter.trim().toLowerCase();

  const childItems = useMemo(() => {
    const m = new Map<number | null, TreeItem[]>();
    const known = new Set(folders.map((f) => f.id));
    for (const item of items) {
      if (q && !item.title.toLowerCase().includes(q)) continue;
      const p = placeOf.get(item.slug);
      // A placement pointing at a folder that no longer exists is the same as
      // no placement: the item comes back to the root rather than vanishing.
      const key =
        p && p.folderId != null && known.has(p.folderId) ? p.folderId : null;
      if (!m.has(key)) m.set(key, []);
      m.get(key)?.push(item);
    }
    for (const [, list] of m) {
      list.sort((a, b) => {
        const ao = placeOf.get(a.slug)?.sortOrder ?? 0;
        const bo = placeOf.get(b.slug)?.sortOrder ?? 0;
        return ao - bo;
      });
    }
    return m;
  }, [items, placeOf, folders, q]);

  const toggle = useCallback(
    (id: number) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        try {
          localStorage.setItem(
            `${EXPAND_KEY}-${scope}`,
            JSON.stringify([...next]),
          );
        } catch {}
        return next;
      });
    },
    [scope],
  );

  const onDrop = useCallback(async () => {
    const drag = dragRef.current;
    const target = targetRef.current;
    if (!drag || !target) {
      setDrag(null);
      setTarget(null);
      return;
    }
    const folderId = target.folderId;

    if (drag.type === "item") {
      // Order within the destination: place it next to the row it was dropped
      // on, or at the end when dropped into a folder's middle.
      const siblings = (childItems.get(folderId) ?? []).filter(
        (i) => i.slug !== drag.slug,
      );
      let index = siblings.length;
      const ref = target.ref;
      if (target.zone !== "inside" && ref.type === "item") {
        const at = siblings.findIndex((i) => i.slug === ref.slug);
        if (at >= 0) index = target.zone === "before" ? at : at + 1;
      }
      const ordered = [
        ...siblings.slice(0, index),
        { slug: drag.slug },
        ...siblings.slice(index),
      ];
      await mutate({
        action: "reorder",
        scope,
        folderId,
        items: ordered.map((i, n) => ({ slug: i.slug, sortOrder: n })),
      });
    } else {
      const ok = await mutate({
        action: "moveFolder",
        id: drag.id,
        parentId: folderId,
        sortOrder: 0,
      });
      if (!ok) {
        // The server refuses a folder dropped inside its own subtree.
        setDrag(null);
        setTarget(null);
        return;
      }
    }

    setDrag(null);
    setTarget(null);
    router.refresh();
  }, [childItems, scope, router, setDrag, setTarget]);

  const zoneFor = (e: React.DragEvent, allowInside: boolean): DropZone => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - r.top;
    if (!allowInside) return y < r.height / 2 ? "before" : "after";
    if (y < r.height * 0.28) return "before";
    if (y > r.height * 0.72) return "after";
    return "inside";
  };

  const isDragged = (ref: Exclude<DragRef, null>) =>
    drag != null &&
    drag.type === ref.type &&
    (drag.type === "folder"
      ? drag.id === (ref as { id: number }).id
      : drag.slug === (ref as { slug: string }).slug);

  function renderFolder(f: TreeFolder, depth: number) {
    const open = expanded.has(f.id) || Boolean(q);
    const subFolders = childFolders.get(f.id) ?? [];
    const subItems = childItems.get(f.id) ?? [];
    const count = subItems.length;
    const ref = { type: "folder" as const, id: f.id };
    const hot =
      target && target.ref.type === "folder" && target.ref.id === f.id;

    return (
      <div key={`f${f.id}`}>
        <div
          draggable={renaming !== f.id}
          onDragStart={(e) => {
            e.stopPropagation();
            setDrag(ref);
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragEnd={() => {
            setDrag(null);
            setTarget(null);
          }}
          onDragOver={(e) => {
            if (!dragRef.current) return;
            e.preventDefault();
            e.stopPropagation();
            const zone = zoneFor(e, true);
            setTarget({
              zone,
              ref,
              folderId: zone === "inside" ? f.id : (f.parentId ?? null),
            });
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDrop();
          }}
          className={`tree-row group ${hot ? `is-${target?.zone}` : ""} ${
            isDragged(ref) ? "is-dragging" : ""
          }`}
          style={{ paddingLeft: 6 + depth * 12 }}
        >
          <button
            type="button"
            onClick={() => toggle(f.id)}
            className="tree-twisty"
            aria-label={open ? "Collapse" : "Expand"}
          >
            <Icon name={open ? "expand_more" : "chevron_right"} size={14} />
          </button>
          <span className="tree-icon">
            <Icon name={open ? "folder_open" : "folder"} size={14} />
          </span>

          {renaming === f.id ? (
            <input
              ref={renameRef}
              defaultValue={f.name}
              onBlur={async (e) => {
                const name = e.target.value.trim();
                setRenaming(null);
                if (name && name !== f.name) {
                  await mutate({ action: "renameFolder", id: f.id, name });
                  router.refresh();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") setRenaming(null);
              }}
              className="tree-rename"
            />
          ) : (
            <button
              type="button"
              onClick={() => toggle(f.id)}
              onDoubleClick={() => setRenaming(f.id)}
              className="tree-label"
              title={`${f.name} — double click to rename`}
            >
              {f.name}
            </button>
          )}

          <span className="tree-count">{count || ""}</span>
          <button
            type="button"
            title="Delete folder. Anything inside moves back to the top."
            onClick={async () => {
              await mutate({ action: "deleteFolder", id: f.id });
              router.refresh();
            }}
            className="tree-action"
          >
            <Icon name="close" size={13} />
          </button>
        </div>

        {open && (
          <div className="tree-children">
            {subFolders.map((sf) => renderFolder(sf, depth + 1))}
            {subItems.map((it) => renderItem(it, depth + 1, f.id))}
            {subFolders.length === 0 && subItems.length === 0 && (
              <div
                className="tree-empty"
                style={{ paddingLeft: 6 + (depth + 1) * 12 }}
                onDragOver={(e) => {
                  if (!dragRef.current) return;
                  e.preventDefault();
                  e.stopPropagation();
                  setTarget({ zone: "inside", ref, folderId: f.id });
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDrop();
                }}
              >
                empty
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  function renderItem(item: TreeItem, depth: number, folderId: number | null) {
    const href = `${base}/${item.slug}/edit`;
    const on = pathname === href;
    const ref = { type: "item" as const, slug: item.slug };
    const hot =
      target && target.ref.type === "item" && target.ref.slug === item.slug;

    return (
      <div
        key={item.slug}
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          setDrag(ref);
          e.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={() => {
          setDrag(null);
          setTarget(null);
        }}
        onDragOver={(e) => {
          if (!dragRef.current) return;
          e.preventDefault();
          e.stopPropagation();
          setTarget({ zone: zoneFor(e, false), ref, folderId });
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDrop();
        }}
        className={`tree-row group ${on ? "is-active" : ""} ${
          hot ? `is-${target?.zone}` : ""
        } ${isDragged(ref) ? "is-dragging" : ""}`}
        style={{ paddingLeft: 6 + depth * 12 }}
      >
        <span className="tree-twisty tree-twisty--empty" />
        <span
          className={`tree-dot ${item.status === "published" ? "is-live" : ""}`}
        />
        <Link href={href} className="tree-label" title={item.title}>
          {item.title}
        </Link>
      </div>
    );
  }

  const rootFolders = childFolders.get(null) ?? [];
  const rootItems = childItems.get(null) ?? [];

  return (
    <div
      className="tree-root"
      onDragOver={(e) => {
        if (!dragRef.current) return;
        e.preventDefault();
        setTarget({
          zone: "inside",
          ref: { type: "folder", id: -1 },
          folderId: null,
        });
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
    >
      <div className="tree-toolbar">
        <button
          type="button"
          onClick={async () => {
            await mutate({ action: "createFolder", scope, name: "New folder" });
            router.refresh();
          }}
          className="tree-newfolder"
          title="New folder"
        >
          <Icon name="create_new_folder" size={14} />
          <span>New folder</span>
        </button>
      </div>

      {rootFolders.map((f) => renderFolder(f, 0))}
      {rootItems.map((it) => renderItem(it, 0, null))}

      {rootFolders.length === 0 && rootItems.length === 0 && (
        <p className="tree-none">Nothing matches.</p>
      )}

      {/* Somewhere to drop an item to take it out of every folder. */}
      <div
        className={`tree-outzone ${
          drag && target?.folderId === null ? "is-hot" : ""
        }`}
      >
        {drag ? "drop here to move to the top level" : ""}
      </div>
    </div>
  );
}
