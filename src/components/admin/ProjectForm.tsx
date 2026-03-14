"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import RichEditor from "@/components/admin/RichEditor";
import MediaPicker from "@/components/admin/MediaPicker";
import { useToast } from "@/components/admin/Toast";

interface ProjectFormProps {
  initialData?: {
    slug: string;
    title: string;
    description: string;
    thumbnail: string;
    status: string;
    postSlugs: string[];
  };
  allPosts: Array<{ slug: string; title: string }>;
  isEdit?: boolean;
}

export default function ProjectForm({
  initialData,
  allPosts,
  isEdit,
}: ProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "draft");
  const [postSlugs, setPostSlugs] = useState<string[]>(
    initialData?.postSlugs ?? [],
  );

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

  const togglePost = (postSlug: string) => {
    setPostSlugs((prev) =>
      prev.includes(postSlug)
        ? prev.filter((s) => s !== postSlug)
        : [...prev, postSlug],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isEdit
        ? `/api/projects/${initialData?.slug}`
        : "/api/projects";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          thumbnail,
          status,
          postSlugs,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "Failed to save", "error");
        return;
      }

      router.push("/admin/projects");
      router.refresh();
    } catch {
      toast("Network error", "error");
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
          Description
        </label>
        <RichEditor content={description} onChange={setDescription} outputFormat="html" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <MediaPicker value={thumbnail} onChange={setThumbnail} label="Thumbnail" />
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

      {allPosts.length > 0 && (
        <div>
          <label className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
            Related Posts
          </label>
          <div className="border border-border max-h-48 overflow-y-auto divide-y divide-border">
            {allPosts.map((post) => (
              <button
                key={post.slug}
                type="button"
                onClick={() => togglePost(post.slug)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  postSlugs.includes(post.slug)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {post.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-primary-foreground px-6 py-2 text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Update Project" : "Create Project"}
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
