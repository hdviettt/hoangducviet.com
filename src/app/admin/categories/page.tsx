"use client";

import { useEffect, useState } from "react";
import ConfirmModal from "@/components/admin/ConfirmModal";

interface Category { slug: string; title: string; }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    if (res.ok) setCategories(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: newSlug, title: newTitle }),
    });
    if (res.ok) { setNewSlug(""); setNewTitle(""); fetchCategories(); }
  };

  const handleDelete = (slug: string) => {
    setConfirmMessage(`Delete category "${slug}"?`);
    setConfirmAction(() => async () => {
      await fetch(`/api/categories/${slug}`, { method: "DELETE" });
      fetchCategories();
    });
    setConfirmOpen(true);
  };

  if (loading) return <div className="text-sm text-muted-foreground">loading...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-medium mb-6">categories</h1>

      <div className="border border-border p-5 mb-8">
        <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">new category</h2>
        <form onSubmit={handleCreate} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-muted-foreground mb-1">title</label>
            <input type="text" value={newTitle}
              onChange={(e) => { setNewTitle(e.target.value); setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); }}
              className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-muted-foreground mb-1">slug</label>
            <input type="text" value={newSlug} onChange={(e) => setNewSlug(e.target.value)}
              className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
          </div>
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 text-sm hover:opacity-90 btn-press">add</button>
        </form>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
          <h2 className="text-xs text-muted-foreground uppercase tracking-wider">all categories</h2>
          <span className="text-xs text-muted-foreground tabular-nums">{categories.length}</span>
        </div>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">no categories yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div
                key={cat.slug}
                className="group flex items-center gap-2 border border-border px-3 py-1.5 hover:border-primary/50 transition-colors stagger-list"
              >
                <span className="text-sm">{cat.title}</span>
                <span className="text-xs text-muted-foreground">{cat.slug}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.slug)}
                  className="text-muted-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 leading-none text-base ml-0.5"
                >
                  ×
                </button>
              </div>
            ))}
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
