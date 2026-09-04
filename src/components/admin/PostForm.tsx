"use client";

import DescriptionMeter from "@/components/admin/DescriptionMeter";
import MediaPicker from "@/components/admin/MediaPicker";
import RichEditor from "@/components/admin/RichEditor";
import { useToast } from "@/components/admin/Toast";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

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

type SaveState = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_MS = 1500;

function countWords(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ") // code fences
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links → text
    .replace(/[#>*_`~-]/g, " ");
  return text.split(/\s+/).filter(Boolean).length;
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return "Just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function PostForm({
  initialData,
  allCategories,
  allProjects,
  isEdit,
}: PostFormProps) {
  const router = useRouter();
  const { toast } = useToast();

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
  const [projectSlug, setProjectSlug] = useState(
    initialData?.projectSlug ?? "",
  );
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Live preview: "edit" is the writer, "split" shows editor + rendered site
  // side by side, "preview" is the rendered site full width. The preview is an
  // iframe of the real /posts/[slug]?preview=1 page, so it is byte-identical to
  // what publishing would show (carousels, SVG render-fences, KaTeX, themes).
  const [view, setView] = useState<"edit" | "split" | "preview">("edit");
  const [savedSlug, setSavedSlug] = useState<string | null>(
    isEdit ? (initialData?.slug ?? null) : null,
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // The slug as it exists on the server. Autosave never renames (a post that
  // belongs to a series is referenced by slug via FK) — only an explicit save
  // applies a slug change.
  const savedSlugRef = useRef<string | null>(
    isEdit ? (initialData?.slug ?? null) : null,
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [, forceTick] = useState(0);
  const savingRef = useRef(false);

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!savedSlugRef.current) setSlug(generateSlug(value));
  };

  const toggleCategory = (catSlug: string) => {
    setCategories((prev) =>
      prev.includes(catSlug)
        ? prev.filter((c) => c !== catSlug)
        : [...prev, catSlug],
    );
  };

  const save = useCallback(
    async (opts: { explicit?: boolean; nextStatus?: string } = {}) => {
      if (savingRef.current) return;
      const effectiveStatus = opts.nextStatus ?? status;
      const finalSlug =
        slug || generateSlug(title) || `post-${Date.now().toString(36)}`;
      if (!title.trim()) {
        if (opts.explicit) toast("Give it a title first", "error");
        return;
      }

      savingRef.current = true;
      setSaveState("saving");
      try {
        const existing = savedSlugRef.current;
        const payload = {
          title,
          // Only an explicit save may rename; autosave keeps the stored slug.
          slug: existing && !opts.explicit ? existing : finalSlug,
          description,
          content,
          thumbnail,
          status: effectiveStatus,
          categories,
          projectSlug: projectSlug || null,
        };
        const res = await fetch(
          existing ? `/api/posts/${existing}` : "/api/posts",
          {
            method: existing ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        if (!res.ok) {
          const msg =
            (await res.json().catch(() => ({}))).error || "Failed to save";
          setSaveState("error");
          if (opts.explicit) toast(msg, "error");
          return;
        }
        const post = await res.json();
        // Keep the URL in step with the stored slug without remounting the editor.
        if (post.slug !== savedSlugRef.current) {
          savedSlugRef.current = post.slug;
          window.history.replaceState(
            null,
            "",
            `/admin/posts/${post.slug}/edit`,
          );
        }
        setSavedSlug(post.slug);
        if (opts.nextStatus) setStatus(opts.nextStatus);
        setSaveState("saved");
        setLastSavedAt(Date.now());
        setDirty(false);
        router.refresh();
      } catch {
        setSaveState("error");
        if (opts.explicit) toast("Network error", "error");
      } finally {
        savingRef.current = false;
      }
    },
    [
      title,
      slug,
      description,
      content,
      thumbnail,
      status,
      categories,
      projectSlug,
      toast,
      router,
    ],
  );

  // Mark dirty on any content/metadata change — but not on the initial mount,
  // which would otherwise trigger a pointless autosave the moment you open a post.
  const mountedRef = useRef(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional change-tracking
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    setDirty(true);
  }, [title, description, content, thumbnail, status, categories, projectSlug]);

  // Debounced autosave — only once the post exists on the server.
  useEffect(() => {
    if (!dirty || !savedSlugRef.current) return;
    const id = setTimeout(() => save(), AUTOSAVE_MS);
    return () => clearTimeout(id);
  }, [dirty, save]);

  // Keep the "saved 2m ago" label honest.
  useEffect(() => {
    if (!lastSavedAt) return;
    const id = setInterval(() => forceTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, [lastSavedAt]);

  // Ctrl/Cmd+S saves explicitly.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save({ explicit: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  // Don't let unsaved work disappear with the tab. A brand-new post that has
  // never been saved is the most dangerous case, so guard that too.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasWork = savedSlugRef.current
        ? true
        : Boolean(title.trim() || content.trim());
      if (dirty && hasWork) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, title, content]);

  // Keep the preview in step: when a save lands, reload the iframe so it shows
  // the latest words. The frame is same-origin, so reload() keeps scroll. The
  // iframe loads its src on its own when the preview first opens, so this only
  // needs to react to saves, not to the view switch.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reload on save only
  useEffect(() => {
    if (view === "edit") return;
    iframeRef.current?.contentWindow?.location.reload();
  }, [lastSavedAt]);

  // Entering a preview should show the latest words, so flush any pending edits.
  const openPreview = (next: "split" | "preview") => {
    setView(next);
    if (dirty && savedSlugRef.current) save();
  };

  const words = countWords(content);
  const readMins = Math.max(1, Math.ceil(words / 200));
  const isPublished = status === "published";
  const previewSrc = savedSlug ? `/posts/${savedSlug}?preview=1` : null;
  const VIEWS = [
    ["edit", "edit", "Edit"],
    ["split", "vertical_split", "Split"],
    ["preview", "visibility", "Preview"],
  ] as const;

  const statusLine =
    saveState === "saving"
      ? "Saving…"
      : saveState === "error"
        ? "Save failed"
        : dirty && savedSlugRef.current
          ? "Unsaved changes"
          : lastSavedAt
            ? `Saved ${timeAgo(lastSavedAt)}`
            : savedSlugRef.current
              ? "Saved"
              : "Not saved yet";

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden -mb-16 -mx-5 sm:-mx-8 lg:-mx-14 xl:-mx-20">
      {/* Editor pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="shrink-0 bg-md-background border-b border-md-outline-variant px-5 sm:px-8 lg:px-14 xl:px-20 py-3 flex items-center gap-3">
          <Link
            href="/admin/posts"
            title="Back to posts"
            className="shrink-0 p-1.5 rounded-lg text-md-on-surface-variant hover:bg-md-on-surface/8 hover:text-md-on-surface transition-colors"
          >
            <Icon name="arrow_back" size={18} />
          </Link>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post title…"
            className="flex-1 bg-transparent text-[22px] leading-7 font-medium tracking-tight focus:outline-none placeholder:text-md-on-surface-variant/40"
            required
          />

          {/* Save state — quiet, always visible */}
          <span
            className={`shrink-0 text-[12px] leading-4 tabular-nums ${
              saveState === "error"
                ? "text-md-error"
                : "text-md-on-surface-variant"
            }`}
          >
            {statusLine}
          </span>

          {/* View toggle: edit / split / rendered preview */}
          <div className="flex items-center rounded-lg border border-md-outline-variant overflow-hidden shrink-0">
            {VIEWS.map(([mode, icon, label]) => (
              <button
                key={mode}
                type="button"
                title={
                  mode !== "edit" && !savedSlug
                    ? "Save once to preview"
                    : label
                }
                onClick={() =>
                  mode === "edit" ? setView("edit") : openPreview(mode)
                }
                disabled={mode !== "edit" && !savedSlug}
                className={`px-2.5 py-1.5 inline-flex items-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  view === mode
                    ? "bg-md-secondary-container text-md-on-secondary-container"
                    : "text-md-on-surface-variant hover:bg-md-on-surface/8"
                }`}
              >
                <Icon name={icon} size={17} />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => save({ explicit: true })}
            disabled={saveState === "saving"}
            className="md-btn md-btn-text md-btn-sm shrink-0"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() =>
              save({
                explicit: true,
                nextStatus: isPublished ? "draft" : "published",
              })
            }
            disabled={saveState === "saving"}
            className={`md-btn md-btn-sm shrink-0 ${
              isPublished ? "md-btn-tonal" : "md-btn-filled"
            }`}
          >
            {isPublished ? "Unpublish" : "Publish"}
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(!drawerOpen)}
            title={drawerOpen ? "Hide sidebar" : "Show sidebar"}
            className="p-1.5 rounded-lg text-md-on-surface-variant hover:text-md-on-surface transition-colors shrink-0"
          >
            <Icon
              name={drawerOpen ? "right_panel_close" : "right_panel_open"}
              size={18}
            />
          </button>
        </div>

        {/* Editor + live preview */}
        <div className="flex-1 min-h-0 overflow-hidden flex">
          {view !== "preview" && (
            <div
              className={`min-w-0 h-full overflow-hidden pt-6 pb-2 ${
                view === "split"
                  ? "w-1/2 border-r border-md-outline-variant px-5 lg:px-8"
                  : "w-full px-5 sm:px-8 lg:px-14 xl:px-20"
              }`}
            >
              <RichEditor content={content} onChange={setContent} />
            </div>
          )}

          {view !== "edit" && (
            <div
              className={`min-w-0 h-full flex flex-col bg-md-surface ${
                view === "split" ? "w-1/2" : "w-full"
              }`}
            >
              <div className="shrink-0 flex items-center gap-2 px-4 py-1.5 border-b border-md-outline-variant text-[12px] leading-4 text-md-on-surface-variant">
                <Icon name="visibility" size={14} />
                <span className="truncate">
                  Live preview{status !== "published" && " · draft"}
                </span>
                <div className="ml-auto flex items-center gap-0.5">
                  <button
                    type="button"
                    title="Refresh preview"
                    onClick={() =>
                      dirty && savedSlugRef.current
                        ? save()
                        : iframeRef.current?.contentWindow?.location.reload()
                    }
                    className="p-1 rounded hover:bg-md-on-surface/8 hover:text-md-on-surface transition-colors"
                  >
                    <Icon name="refresh" size={15} />
                  </button>
                  {previewSrc && (
                    <a
                      href={previewSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open preview in new tab"
                      className="p-1 rounded hover:bg-md-on-surface/8 hover:text-md-on-surface transition-colors"
                    >
                      <Icon name="open_in_new" size={15} />
                    </a>
                  )}
                </div>
              </div>
              {previewSrc ? (
                <iframe
                  ref={iframeRef}
                  src={previewSrc}
                  title="Post preview"
                  className="flex-1 w-full border-0 bg-md-surface"
                />
              ) : (
                <div className="flex-1 grid place-items-center px-6 text-center text-[13px] leading-5 text-md-on-surface-variant">
                  Save the draft once, then it previews here exactly as the site
                  will render it.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Writing status bar */}
        <div className="shrink-0 px-5 sm:px-8 lg:px-14 xl:px-20 py-2 flex items-center gap-4 text-[12px] leading-4 text-md-on-surface-variant border-t border-md-outline-variant">
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isPublished ? "bg-md-primary" : "bg-md-on-surface-variant"
              }`}
            />
            {status}
          </span>
          <span className="tabular-nums">{words.toLocaleString()} words</span>
          <span className="tabular-nums">{readMins} min read</span>
          <span className="ml-auto opacity-70">⌘S / Ctrl+S to save</span>
        </div>
      </div>

      {/* Right metadata drawer */}
      {drawerOpen && (
        <aside className="w-80 shrink-0 border-l border-md-outline-variant bg-transparent overflow-y-auto">
          <div className="p-5 space-y-6">
            <section>
              <h3 className="text-[13px] leading-[18px] text-md-on-surface-variant mb-3 pb-2 border-b border-md-outline-variant">
                metadata
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="md-field-label">Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="md-field"
                    required
                  />
                  {savedSlugRef.current && slug !== savedSlugRef.current && (
                    <p className="text-[12px] leading-4 text-md-on-surface-variant/80 mt-1">
                      press “save draft” to apply the new slug
                    </p>
                  )}
                </div>
                <div>
                  <label className="md-field-label">Meta description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    placeholder="shown in full on the feed cards and as the Google snippet — aim for ≤160 characters"
                    className="md-field !leading-6"
                  />
                  <DescriptionMeter value={description} />
                </div>
                {allProjects.length > 0 && (
                  <div>
                    <label className="md-field-label">Collection</label>
                    <select
                      value={projectSlug}
                      onChange={(e) => setProjectSlug(e.target.value)}
                      className="md-field"
                    >
                      <option value="">None</option>
                      {allProjects.map((p) => (
                        <option key={p.slug} value={p.slug}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-[13px] leading-[18px] text-md-on-surface-variant mb-3 pb-2 border-b border-md-outline-variant">
                thumbnail
              </h3>
              <MediaPicker value={thumbnail} onChange={setThumbnail} />
            </section>

            {allCategories.length > 0 && (
              <section>
                <h3 className="text-[13px] leading-[18px] text-md-on-surface-variant mb-3 pb-2 border-b border-md-outline-variant">
                  categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((cat) => {
                    const selected = categories.includes(cat.slug);
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => toggleCategory(cat.slug)}
                        className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border text-[13px] leading-[18px] transition-all duration-200 ease-md-standard ${
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

            {savedSlug && (
              <a
                href={
                  isPublished
                    ? `/posts/${savedSlug}`
                    : `/posts/${savedSlug}?preview=1`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[14px] leading-5 text-md-on-surface-variant hover:text-md-primary transition-colors"
              >
                {isPublished ? "view post" : "preview post"}
                <Icon name="open_in_new" size={16} />
              </a>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
