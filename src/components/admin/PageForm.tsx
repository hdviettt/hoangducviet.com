"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface PageFormProps {
  initialData?: {
    slug: string;
    title: string;
    body: string;
    navigation: string;
  };
  isEdit?: boolean;
}

export default function PageForm({ initialData, isEdit }: PageFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [body, setBody] = useState(initialData?.body ?? "");
  const [navigation, setNavigation] = useState(initialData?.navigation ?? "no");

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEdit) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let parsedBody = null;
      if (body.trim()) {
        try {
          parsedBody = JSON.parse(body);
        } catch {
          alert("Invalid JSON in body");
          setSaving(false);
          return;
        }
      }

      const url = isEdit ? `/api/pages/${initialData?.slug}` : "/api/pages";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, body: parsedBody, navigation }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to save");
        return;
      }

      router.push("/admin/pages");
      router.refresh();
    } catch {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div>
        <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
          Show in Navigation
        </label>
        <select
          value={navigation}
          onChange={(e) => setNavigation(e.target.value)}
          className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
          Body (Editor.js JSON)
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full bg-background border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary min-h-[300px] resize-y"
          placeholder='{"time": 0, "blocks": [], "version": "2.0"}'
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-primary-foreground px-6 py-2 text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Update Page" : "Create Page"}
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
