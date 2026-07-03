"use client";

import MediaPicker from "@/components/admin/MediaPicker";
import RichEditor from "@/components/admin/RichEditor";
import { useToast } from "@/components/admin/Toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface WorkFormProps {
  initialData?: {
    slug: string;
    title: string;
    tagline: string;
    content: string;
    thumbnail: string;
    repoUrl: string;
    liveUrl: string;
    techTags: string[];
    status: string;
    buildStatus: string;
    featured: boolean;
    sortOrder: number;
    postSlugs: string[];
  };
  allPosts: Array<{ slug: string; title: string }>;
  isEdit?: boolean;
}

export default function WorkForm({
  initialData,
  allPosts,
  isEdit,
}: WorkFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [tagline, setTagline] = useState(initialData?.tagline ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail ?? "");
  const [repoUrl, setRepoUrl] = useState(initialData?.repoUrl ?? "");
  const [liveUrl, setLiveUrl] = useState(initialData?.liveUrl ?? "");
  const [techTagsInput, setTechTagsInput] = useState(
    (initialData?.techTags ?? []).join(", "),
  );
  const [status, setStatus] = useState(initialData?.status ?? "draft");
  const [buildStatus, setBuildStatus] = useState(
    initialData?.buildStatus ?? "live",
  );
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [sortOrder, setSortOrder] = useState(String(initialData?.sortOrder ?? 0));
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
      const endpoint = isEdit ? `/api/work/${initialData?.slug}` : "/api/work";
      const method = isEdit ? "PUT" : "POST";
      const techTags = techTagsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          tagline: tagline || null,
          content,
          thumbnail,
          repoUrl: repoUrl || null,
          liveUrl: liveUrl || null,
          techTags,
          status,
          buildStatus,
          featured,
          sortOrder: Number(sortOrder) || 0,
          postSlugs,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "Failed to save", "error");
        return;
      }

      router.push("/admin/work");
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
            title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="md-field"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
            slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="md-field"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
          tagline <span className="normal-case">(shown on cards)</span>
        </label>
        <textarea
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          rows={2}
          placeholder="One-liner describing the project..."
          className="md-field"
        />
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
          content <span className="normal-case">(long writeup on the project page)</span>
        </label>
        <RichEditor content={content} onChange={setContent} outputFormat="html" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
            repo url
          </label>
          <input
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/..."
            className="md-field"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
            live url
          </label>
          <input
            type="url"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            placeholder="https://..."
            className="md-field"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
          tech tags <span className="normal-case">(comma-separated)</span>
        </label>
        <input
          type="text"
          value={techTagsInput}
          onChange={(e) => setTechTagsInput(e.target.value)}
          placeholder="Python, Next.js, Postgres"
          className="md-field"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <MediaPicker value={thumbnail} onChange={setThumbnail} label="thumbnail" />
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
              build status
            </label>
            <select
              value={buildStatus}
              onChange={(e) => setBuildStatus(e.target.value)}
              className="md-field"
            >
              <option value="live">live</option>
              <option value="wip">work in progress</option>
              <option value="archived">archived</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
              visibility
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="md-field"
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
            sort order <span className="normal-case">(lower = first)</span>
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="md-field"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground pb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="w-4 h-4 accent-[var(--primary)]"
          />
          featured
        </label>
      </div>

      {allPosts.length > 0 && (
        <div>
          <label className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">
            related posts <span className="normal-case">(links the project to its writing)</span>
          </label>
          <div className="border border-border bg-card max-h-48 overflow-y-auto divide-y divide-border">
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
        <button type="submit" disabled={saving} className="md-btn md-btn-filled">
          {saving ? "saving..." : isEdit ? "update project" : "create project"}
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
