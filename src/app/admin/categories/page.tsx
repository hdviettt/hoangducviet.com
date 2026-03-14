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

  const handleDelete = async (slug: string) => {
    if (!confirm(`Delete "${slug}"?`)) return;
    const res = await fetch(`/api/categories/${slug}`, { method: "DELETE" });
    if (res.ok) fetchCategories();
  };

  if (loading) return <div className="text-[#666]">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-8">Categories</h1>

      <form onSubmit={handleCreate} className="flex gap-3 mb-8 items-end">
        <div>
          <label className="block text-xs text-[#888] mb-1.5">Title</label>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => {
              setNewTitle(e.target.value);
              setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
            }}
            className="admin-input"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-[#888] mb-1.5">Slug</label>
          <input
            type="text"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            className="admin-input"
            required
          />
        </div>
        <button type="submit" className="admin-btn">Add</button>
      </form>

      <div className="admin-card p-0">
        {categories.map((cat) => (
          <div
            key={cat.slug}
            className="flex items-center justify-between px-5 py-3 border-b border-[#222] last:border-0"
          >
            <div>
              <span className="text-sm text-[#ccc]">{cat.title}</span>
              <span className="text-xs text-[#555] ml-2">({cat.slug})</span>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(cat.slug)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-[#666]">No categories yet.</div>
        )}
      </div>
    </div>
  );
}
