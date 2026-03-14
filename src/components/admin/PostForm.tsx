"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import RichEditor from "@/components/admin/RichEditor";

interface PostFormProps {
  initialData?: {
    slug: string;
    title: string;
    description: string;
    content: string;
    thumbnail: string;
    status: string;
    categories: string[];
  };
  allCategories: Array<{ slug: string; title: string }>;
  isEdit?: boolean;
}

export default function PostForm({
  initialData,
  allCategories,
  isEdit,
}: PostFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "draft");
  const [categories, setCategories] = useState<string[]>(initialData?.categories ?? []);
  const [showMeta, setShowMeta] = useState(false);

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEdit) setSlug(generateSlug(value));
  };

  const toggleCategory = (catSlug: string) => {
    setCategories((prev) =>
      prev.includes(catSlug) ? prev.filter((c) => c !== catSlug) : [...prev, catSlug],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEdit ? `/api/posts/${initialData?.slug}` : "/api/posts";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, description, content, thumbnail, status, categories }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to save");
        return;
      }
      router.push("/admin/posts");
      router.refresh();
    } catch {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        type="text"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Post title..."
        className="w-full bg-transparent text-2xl font-semibold text-white focus:outline-none placeholder:text-[#444]"
        required
      />

      <RichEditor content={content} onChange={setContent} />

      <button
        type="button"
        onClick={() => setShowMeta(!showMeta)}
        className="text-xs text-[#666] hover:text-[#aaa] transition-colors"
      >
        {showMeta ? "Hide settings ▲" : "Post settings ▼"}
      </button>

      {showMeta && (
        <div className="admin-card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#888] mb-1.5">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="admin-input"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-[#888] mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="admin-select"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#888] mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="admin-input"
              placeholder="Short excerpt for SEO"
            />
          </div>

          <div>
            <label className="block text-xs text-[#888] mb-1.5">Thumbnail URL</label>
            <input
              type="text"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              className="admin-input"
              placeholder="/uploads/image.jpg"
            />
          </div>

          {allCategories.length > 0 && (
            <div>
              <label className="block text-xs text-[#888] mb-2">Categories</label>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => toggleCategory(cat.slug)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      categories.includes(cat.slug)
                        ? "border-blue-500 text-blue-400 bg-blue-500/10"
                        : "border-[#333] text-[#888] hover:border-[#555]"
                    }`}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="admin-btn">
          {saving ? "Saving..." : isEdit ? "Update" : "Publish"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm text-[#888] hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
