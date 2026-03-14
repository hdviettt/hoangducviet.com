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
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="post title..."
        className="w-full bg-transparent text-xl font-medium focus:outline-none placeholder:text-muted-foreground/40"
        required
      />

      <RichEditor content={content} onChange={setContent} />

      <button
        type="button"
        onClick={() => setShowMeta(!showMeta)}
        className="text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        {showMeta ? "▲ hide settings" : "▼ post settings"}
      </button>

      {showMeta && (
        <div className="border border-border p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">slug</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary">
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="short excerpt for SEO" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">thumbnail</label>
            <input type="text" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)}
              className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="/uploads/image.jpg" />
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

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="bg-primary text-primary-foreground px-6 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
          {saving ? "saving..." : isEdit ? "update" : "publish"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          cancel
        </button>
      </div>
    </form>
  );
}
