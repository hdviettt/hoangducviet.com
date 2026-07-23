"use client";

import ConfirmModal from "@/components/admin/ConfirmModal";
import PageHeader from "@/components/admin/PageHeader";
import { useCallback, useEffect, useMemo, useState } from "react";

interface MediaItem {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string | null;
  size: number | null;
  uploadedAt: string;
  url: string;
}

type SortKey = "date" | "name" | "size";
type SortDir = "asc" | "desc";

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Search & sort
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Selection
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Inline editing
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // Confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const fetchMedia = useCallback(async () => {
    const res = await fetch("/api/media");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Filter & sort
  const filtered = useMemo(() => {
    let list = items;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.originalName.toLowerCase().includes(q) ||
          i.filename.toLowerCase().includes(q),
      );
    }
    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") {
        cmp =
          new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      } else if (sortKey === "name") {
        cmp = a.originalName.localeCompare(b.originalName);
      } else if (sortKey === "size") {
        cmp = (a.size ?? 0) - (b.size ?? 0);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [items, search, sortKey, sortDir]);

  // Upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        await fetch("/api/media", { method: "POST", body: formData });
      } catch {}
    }
    await fetchMedia();
    setUploading(false);
    e.target.value = "";
  };

  const requestConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  // Single delete
  const handleDelete = (id: number, name: string) => {
    requestConfirm(`Delete "${name}"?`, async () => {
      await fetch(`/api/media/${id}`, { method: "DELETE" });
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      fetchMedia();
    });
  };

  // Batch delete
  const handleBatchDelete = () => {
    if (selected.size === 0) return;
    requestConfirm(
      `Delete ${selected.size} item${selected.size > 1 ? "s" : ""}?`,
      async () => {
        await fetch("/api/media/batch-delete", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: [...selected] }),
        });
        setSelected(new Set());
        fetchMedia();
      },
    );
  };

  // Selection helpers
  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((i) => i.id)));
    }
  };

  // Rename
  const startEdit = (item: MediaItem) => {
    setEditingId(item.id);
    setEditValue(item.originalName);
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    const trimmed = editValue.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    await fetch(`/api/media/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalName: trimmed }),
    });
    setEditingId(null);
    fetchMedia();
  };

  const cancelEdit = () => setEditingId(null);

  // Copy path
  const copyPath = (url: string) => navigator.clipboard.writeText(url);

  // Sort toggle
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const sortLabel = (key: SortKey) => {
    const arrow = sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";
    return key.charAt(0).toUpperCase() + key.slice(1) + arrow;
  };

  if (loading)
    return (
      <div className="text-[15px] leading-[22px] text-md-on-surface-variant">
        Loading…
      </div>
    );

  return (
    <div>
      {/* Sticky header + toolbar */}
      <div className="sticky top-0 z-10 bg-md-background pb-4 -mx-5 sm:-mx-8 lg:-mx-14 xl:-mx-20 px-5 sm:px-8 lg:px-14 xl:px-20">
        <PageHeader
          title="Media"
          count={filtered.length}
          action={
            <label className="md-btn md-btn-filled md-btn-sm cursor-pointer">
              {uploading ? (
                <span className="animate-pulse">Uploading…</span>
              ) : (
                "Upload"
              )}
              <input
                type="file"
                multiple
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          }
        />

        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media…"
            className="md-field-dense w-60"
          />
          <div className="flex items-center gap-1 text-[13px] leading-[18px] text-md-on-surface-variant">
            <span>Sort</span>
            {(["date", "name", "size"] as SortKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleSort(key)}
                className={`px-2 py-1 transition-colors ${
                  sortKey === key
                    ? "text-md-on-surface font-medium"
                    : "hover:text-md-on-surface"
                }`}
              >
                {sortLabel(key)}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          {filtered.length > 0 && (
            <button
              type="button"
              onClick={selectAll}
              className="text-[13px] leading-[18px] text-md-on-surface-variant hover:text-md-on-surface transition-colors"
            >
              {selected.size === filtered.length
                ? "Deselect all"
                : "Select all"}
            </button>
          )}
          {selected.size > 0 && (
            <button
              type="button"
              onClick={handleBatchDelete}
              className="text-[13px] leading-[18px] text-md-error hover:underline"
            >
              Delete {selected.size} selected
            </button>
          )}
        </div>

        <div className="text-[13px] leading-[18px] text-md-on-surface-variant mt-3">
          {filtered.length} item{filtered.length !== 1 ? "s" : ""}
          {search && ` matching "${search}"`}
          {selected.size > 0 && ` · ${selected.size} selected`}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6 stagger-list">
        {filtered.map((item) => {
          const isSelected = selected.has(item.id);
          const isEditing = editingId === item.id;

          return (
            // No card box: the picture is the object, exactly as on the
            // reader-facing side, where a thumbnail is an image behind an
            // inset hairline and nothing else.
            <div key={item.id} className="group">
              <div
                className={`aspect-square bg-md-surface-container relative overflow-hidden cursor-pointer rounded-[var(--md-sys-shape-corner-large)] ring-1 ring-inset transition-shadow ${
                  isSelected
                    ? "ring-2 ring-md-primary"
                    : "ring-md-outline-variant"
                }`}
                onClick={() => toggleSelect(item.id)}
              >
                {item.mimeType?.startsWith("image/") ? (
                  <img
                    src={item.url}
                    alt={item.originalName}
                    className="w-full h-full object-cover media-thumb-hover"
                  />
                ) : item.mimeType?.startsWith("video/") ? (
                  <>
                    {/* biome-ignore lint/a11y/useMediaCaption: silent library thumbnail */}
                    <video
                      src={item.url}
                      muted
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="w-9 h-9 rounded-full bg-md-background/70 flex items-center justify-center text-md-on-surface">
                        ▶
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[12px] leading-4 text-md-on-surface-variant">
                    {item.mimeType?.split("/")[1] || "file"}
                  </div>
                )}
                {/* The tick only exists once you are selecting, or hovering */}
                <div
                  className={`absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center text-[12px] transition-opacity ${
                    isSelected
                      ? "bg-md-primary text-md-on-primary opacity-100"
                      : "bg-md-background/80 ring-1 ring-inset ring-md-outline-variant opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {isSelected && "✓"}
                </div>
              </div>

              {/* Info */}
              <div className="pt-2">
                {isEditing ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="md-field-dense flex-1 min-w-0"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="text-[13px] leading-[18px] text-md-primary hover:underline shrink-0"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <p
                    className="text-[13px] leading-[18px] truncate cursor-pointer hover:text-md-primary transition-colors"
                    onClick={() => startEdit(item)}
                    title="Click to rename"
                  >
                    {item.originalName}
                  </p>
                )}
                {/* Size at rest; the two actions replace it on hover, so the
                    grid stays a wall of pictures until you reach for one. */}
                <div className="relative h-[18px] mt-0.5">
                  <span className="absolute inset-0 text-[12px] leading-[18px] text-md-on-surface-variant tabular-nums transition-opacity group-hover:opacity-0">
                    {formatSize(item.size)}
                  </span>
                  <div className="absolute inset-0 flex gap-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => copyPath(item.url)}
                      className="text-[12px] leading-[18px] text-md-on-surface-variant hover:text-md-on-surface"
                    >
                      Copy URL
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.originalName)}
                      className="text-[12px] leading-[18px] text-md-on-surface-variant hover:text-md-error"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-[15px] leading-[22px] text-md-on-surface-variant">
            {search ? `No results for “${search}”` : "No media yet."}
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        message={confirmMessage}
        confirmLabel="delete"
        onConfirm={() => {
          setConfirmOpen(false);
          confirmAction?.();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
