"use client";

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

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    if (res.ok) {
      setCategories(await res.json());
    }
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

  const handleDelete = async (slug: string) => {
    if (!confirm(`Delete category "${slug}"?`)) return;
    const res = await fetch(`/api/categories/${slug}`, { method: "DELETE" });
    if (res.ok) {
      fetchCategories();
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-xl font-medium mb-6">Categories</h1>

      {/* Create form */}
      <form onSubmit={handleCreate} className="flex gap-3 mb-6 items-end">
        <div>
          <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
            Title
          </label>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => {
              setNewTitle(e.target.value);
              setNewSlug(generateSlug(e.target.value));
            }}
            className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
            Slug
          </label>
          <input
            type="text"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-4 py-2 text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
        >
          Add
        </button>
      </form>

      {/* List */}
      <div className="border border-border">
        <div className="divide-y divide-border">
          {categories.map((cat) => (
            <div
              key={cat.slug}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <span className="text-sm">{cat.title}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({cat.slug})
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(cat.slug)}
                className="text-xs text-destructive hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No categories yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
