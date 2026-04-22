"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import RichEditor from "@/components/admin/RichEditor";
import MediaPicker from "@/components/admin/MediaPicker";
import { useToast } from "@/components/admin/Toast";
import { PanelRightOpen, PanelRightClose } from "lucide-react";

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
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
            <span className={`w-1.5 h-1.5 rounded-full ${status === "published" ? "bg-green-500" : "bg-yellow-500"}`} />
            {status}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-primary-foreground px-5 py-1.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
          >
            {saving ? "saving..." : isEdit ? "update" : "publish"}
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(!drawerOpen)}
            title={drawerOpen ? "Hide sidebar" : "Show sidebar"}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            {drawerOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
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
              <h3 className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3 pb-2 border-b border-border">
                publish
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Metadata */}
            <section>
              <h3 className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3 pb-2 border-b border-border">
                metadata
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-input border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="short excerpt for SEO"
                    className="w-full bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                  />
                </div>
                {allProjects.length > 0 && (
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">project</label>
                    <select
                      value={projectSlug}
                      onChange={(e) => setProjectSlug(e.target.value)}
                      className="w-full bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
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
              <h3 className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3 pb-2 border-b border-border">
                thumbnail
              </h3>
              <MediaPicker value={thumbnail} onChange={setThumbnail} />
            </section>

            {/* Categories */}
            {allCategories.length > 0 && (
              <section>
                <h3 className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3 pb-2 border-b border-border">
                  categories
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {allCategories.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => toggleCategory(cat.slug)}
                      className={`px-2 py-1 text-xs border transition-colors ${
                        categories.includes(cat.slug)
                          ? "border-primary text-primary bg-primary/10"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      {cat.title}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        </aside>
      )}
    </form>
  );
}
