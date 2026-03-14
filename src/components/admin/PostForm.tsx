"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import RichEditor from "@/components/admin/RichEditor";
import MediaPicker from "@/components/admin/MediaPicker";

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

export default function PostForm({ initialData, allCategories, isEdit }: PostFormProps) {
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
      if (!res.ok) { alert((await res.json()).error || "Failed to save"); return; }
      router.push("/admin/posts");
      router.refresh();
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Sticky top bar: title + actions */}
      <div className="sticky top-0 z-20 bg-background border-b border-border pb-3 mb-4 flex items-center gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="post title..."
          className="flex-1 bg-transparent text-xl font-medium focus:outline-none placeholder:text-muted-foreground/40"
          required
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="bg-background border border-border px-3 py-1.5 text-xs focus:outline-none focus:border-primary shrink-0">
          <option value="draft">draft</option>
          <option value="published">published</option>
        </select>
        <button type="submit" disabled={saving}
          className="bg-primary text-primary-foreground px-5 py-1.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0">
          {saving ? "saving..." : isEdit ? "update" : "publish"}
        </button>
        <button type="button" onClick={() => setShowMeta(!showMeta)}
          className="text-xs text-muted-foreground hover:text-primary transition-colors shrink-0">
          {showMeta ? "▲ settings" : "⚙ settings"}
        </button>
      </div>

      {/* Collapsible metadata panel */}
      {showMeta && (
        <div className="border border-border p-4 space-y-3 mb-4 shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">slug</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">description</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="short excerpt for SEO" />
            </div>
          </div>
          <div>
            <MediaPicker value={thumbnail} onChange={setThumbnail} label="thumbnail" />
          </div>
          {allCategories.length > 0 && (
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">categories</label>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((cat) => (
                  <button key={cat.slug} type="button" onClick={() => toggleCategory(cat.slug)}
                    className={`px-3 py-1 text-xs border transition-colors ${
                      categories.includes(cat.slug)
                        ? "border-primary text-primary bg-primary/10"
                        : "border-border text-muted-foreground hover:border-foreground"
                    }`}>
                    {cat.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Editor fills remaining space */}
      <div className="flex-1 min-h-0">
        <RichEditor content={content} onChange={setContent} />
      </div>
    </form>
  );
}
