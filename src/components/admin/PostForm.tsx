"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import RichEditor from "@/components/admin/RichEditor";
import MediaPicker from "@/components/admin/MediaPicker";
import { useToast } from "@/components/admin/Toast";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

interface PostFormProps {
  initialData?: {
    slug: string;
    title: string;
    description: string;
    content: string;
    thumbnail: string;
    status: string;
    categories: string[];
    projectSlug: string;
  };
  allCategories: Array<{ slug: string; title: string }>;
  allProjects: Array<{ slug: string; title: string }>;
  isEdit?: boolean;
}

export default function PostForm({ initialData, allCategories, allProjects, isEdit }: PostFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "draft");
  const [categories, setCategories] = useState<string[]>(initialData?.categories ?? []);
  const [projectSlug, setProjectSlug] = useState(initialData?.projectSlug ?? "");
  const [drawerOpen, setDrawerOpen] = useState(true);

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
        body: JSON.stringify({ title, slug, description, content, thumbnail, status, categories, projectSlug: projectSlug || null }),
      });
      if (!res.ok) { toast((await res.json()).error || "Failed to save", "error"); return; }
      router.push("/admin/posts");
      router.refresh();
    } catch { toast("Network error", "error"); }
    finally { setSaving(false); }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-[calc(100vh-2.75rem)] overflow-hidden -my-8 -mx-8"
    >
      {/* Editor pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="shrink-0 bg-background border-b border-border px-8 py-3 flex items-center gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="post title..."
            className="flex-1 bg-transparent text-xl font-medium focus:outline-none placeholder:text-muted-foreground/40"
            required
          />
          <div className="flex items-center gap-1 md-label-small text-muted-foreground font-mono uppercase tracking-widest">
            <span className={`w-1.5 h-1.5 rounded-full ${status === "published" ? "bg-green-500" : "bg-yellow-500"}`} />
            {status}
          </div>
          <Button type="submit" disabled={saving} size="sm" className="shrink-0">
            {saving ? "saving..." : isEdit ? "update" : "publish"}
          </Button>
          <button
            type="button"
            onClick={() => setDrawerOpen(!drawerOpen)}
            title={drawerOpen ? "Hide sidebar" : "Show sidebar"}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <Icon name={drawerOpen ? "right_panel_close" : "right_panel_open"} size={18} />
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-0 overflow-hidden px-8 py-6">
          <RichEditor content={content} onChange={setContent} />
        </div>
      </div>

      {/* Right metadata drawer */}
      {drawerOpen && (
        <aside className="w-80 shrink-0 border-l border-border bg-card overflow-y-auto">
          <div className="p-5 space-y-6">
            {/* Publish */}
            <section>
              <h3 className="md-label-small text-muted-foreground uppercase tracking-widest font-semibold mb-3 pb-2 border-b border-border">
                publish
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="md-field-label">status</label>
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
            </section>

            {/* Metadata */}
            <section>
              <h3 className="md-label-small text-muted-foreground uppercase tracking-widest font-semibold mb-3 pb-2 border-b border-border">
                metadata
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="md-field-label">slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="md-field font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="md-field-label">description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="short excerpt for SEO"
                    className="md-field"
                  />
                </div>
                {allProjects.length > 0 && (
                  <div>
                    <label className="md-field-label">project</label>
                    <select
                      value={projectSlug}
                      onChange={(e) => setProjectSlug(e.target.value)}
                      className="md-field"
                    >
                      <option value="">none</option>
                      {allProjects.map((p) => (
                        <option key={p.slug} value={p.slug}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </section>

            {/* Thumbnail */}
            <section>
              <h3 className="md-label-small text-muted-foreground uppercase tracking-widest font-semibold mb-3 pb-2 border-b border-border">
                thumbnail
              </h3>
              <MediaPicker value={thumbnail} onChange={setThumbnail} />
            </section>

            {/* Categories */}
            {allCategories.length > 0 && (
              <section>
                <h3 className="md-label-small text-muted-foreground uppercase tracking-widest font-semibold mb-3 pb-2 border-b border-border">
                  categories
                </h3>
                {/* M3 filter chips */}
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((cat) => {
                    const selected = categories.includes(cat.slug);
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => toggleCategory(cat.slug)}
                        className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border md-label-medium transition-all duration-200 ease-md-standard ${
                          selected
                            ? "bg-md-secondary-container text-md-on-secondary-container border-md-secondary-container"
                            : "bg-transparent text-md-on-surface-variant border-md-outline hover:bg-md-on-surface/8"
                        }`}
                      >
                        {selected && <Icon name="check" size={16} />}
                        {cat.title}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </aside>
      )}
    </form>
  );
}
