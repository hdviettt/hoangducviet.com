"use client";

import MarkdownContent from "@/components/MarkdownContent";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [showPreview, setShowPreview] = useState(false);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [content, setContent] = useState(initialData?.content ?? "");
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "draft");
  const [categories, setCategories] = useState<string[]>(
    initialData?.categories ?? [],
  );

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEdit) {
      setSlug(generateSlug(value));
    }
  };

  const toggleCategory = (catSlug: string) => {
    setCategories((prev) =>
      prev.includes(catSlug)
        ? prev.filter((c) => c !== catSlug)
        : [...prev, catSlug],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isEdit ? `/api/posts/${initialData?.slug}` : "/api/posts";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          content,
          thumbnail,
          status,
          categories,
        }),
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
      {/* Title & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
          placeholder="Short excerpt for SEO"
        />
      </div>

      {/* Content Editor */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">
            Content (Markdown)
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-primary hover:underline"
          >
            {showPreview ? "Edit" : "Preview"}
          </button>
        </div>
        {showPreview ? (
          <div className="border border-border p-4 min-h-[400px] article-content bg-card">
            <MarkdownContent content={content} />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary min-h-[400px] resize-y"
            placeholder="Write your post in Markdown..."
          />
        )}
      </div>

      {/* Thumbnail & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
            Thumbnail URL
          </label>
          <input
            type="text"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
            placeholder="/uploads/image.jpg"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {/* Categories */}
      {allCategories.length > 0 && (
        <div>
          <label className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
            Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => toggleCategory(cat.slug)}
                className={`px-3 py-1 text-xs border transition-colors ${
                  categories.includes(cat.slug)
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-muted-foreground hover:border-foreground"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-primary-foreground px-6 py-2 text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Update Post" : "Create Post"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 text-sm text-muted-foreground border border-border hover:border-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
