"use client";

import ConfirmModal from "@/components/admin/ConfirmModal";
import PageHeader from "@/components/admin/PageHeader";
import { useEffect, useState } from "react";

interface Category {
  slug: string;
  title: string;
}

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

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: newSlug, title: newTitle }),
    });
    if (res.ok) {
      setNewSlug("");
      setNewTitle("");
      fetchCategories();
    }
  };

  const handleDelete = (slug: string) => {
    setConfirmMessage(`Delete category "${slug}"?`);
    setConfirmAction(() => async () => {
      await fetch(`/api/categories/${slug}`, { method: "DELETE" });
      fetchCategories();
    });
    setConfirmOpen(true);
  };

  if (loading)
    return (
      <div className="text-[15px] leading-[22px] text-md-on-surface-variant">
        Loading…
      </div>
    );

  return (
    <div className="max-w-2xl">
      <PageHeader title="Categories" />

      <div className="rounded-2xl border border-md-outline-variant p-5 mb-8">
        <h2 className="text-[13px] leading-[18px] text-md-on-surface-variant mb-4">
          New category
        </h2>
        <form onSubmit={handleCreate} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="md-field-label">Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                setNewSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, ""),
                );
              }}
              className="md-field"
              required
            />
          </div>
          <div className="flex-1">
            <label className="md-field-label">Slug</label>
            <input
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              className="md-field"
              required
            />
          </div>
          <button type="submit" className="md-btn md-btn-filled">
            Add
          </button>
        </form>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-md-outline-variant">
          <h2 className="text-[13px] leading-[18px] text-md-on-surface-variant">
            All categories
          </h2>
          <span className="text-[13px] leading-[18px] text-md-on-surface-variant tabular-nums">
            {categories.length}
          </span>
        </div>
        {categories.length === 0 ? (
          <p className="text-[15px] leading-[22px] text-md-on-surface-variant py-4">
            No categories yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div
                key={cat.slug}
                className="group flex items-center gap-2 rounded-full border border-md-outline-variant px-3 py-1.5 hover:border-md-primary/50 transition-colors stagger-list"
              >
                <span className="text-[15px] leading-[22px]">{cat.title}</span>
                <span className="text-[13px] leading-[18px] text-md-on-surface-variant">
                  {cat.slug}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.slug)}
                  className="text-md-on-surface-variant/40 hover:text-md-error transition-colors opacity-0 group-hover:opacity-100 leading-none text-base ml-0.5"
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
