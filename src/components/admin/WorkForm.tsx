"use client";

import MediaPicker from "@/components/admin/MediaPicker";
import RichEditor from "@/components/admin/RichEditor";
import { useToast } from "@/components/admin/Toast";
import { MARK_IDS } from "@/components/home/logo-marks";
import {
  LogoRow as MarkRow,
  MARKS_SHOWN,
  cardMarks,
} from "@/components/work/StackChips";
import type {
  ProjectLogo,
  ProjectMedia,
  ProjectMetric,
  ProjectStackGroup,
} from "@/db/schema";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface WorkFormProps {
  initialData?: {
    slug: string;
    title: string;
    description: string;
    content: string;
    thumbnail: string;
    status: string;
    buildStatus: string;
    featured: boolean;
    stack: ProjectStackGroup[];
    models: ProjectLogo[];
    media: ProjectMedia[];
    metrics: ProjectMetric[];
    postSlugs: string[];
    categories: string[];
  };
  allPosts: Array<{ slug: string; title: string }>;
  allProjects: Array<{ slug: string; title: string }>;
  allCategories: Array<{ slug: string; title: string }>;
  isEdit?: boolean;
}

const removeBtn =
  "shrink-0 h-8 w-8 inline-flex items-center justify-center rounded-lg text-md-on-surface-variant hover:bg-md-error/10 hover:text-md-error";

const moveBtn =
  "shrink-0 h-8 w-6 inline-flex items-center justify-center rounded-lg text-md-on-surface-variant hover:bg-md-on-surface/[0.08] hover:text-md-on-surface disabled:opacity-25 disabled:hover:bg-transparent";

// Move one item within a list. Order is content here, not presentation: a work
// card draws the first four marks it finds, so which four appear on the
// homepage is decided by exactly this operation. Before it existed the only way
// to promote a model was to delete the ones above it and type them back.
function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = arr.slice();
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}

// Shared editor for a single {name, mark?, letter?} logo chip.
function LogoRow({
  item,
  onChange,
  onRemove,
  onMove,
  first,
  last,
}: {
  item: ProjectLogo;
  onChange: (patch: Partial<ProjectLogo>) => void;
  onRemove: () => void;
  // Optional so the callers that do not order anything stay unchanged.
  onMove?: (dir: -1 | 1) => void;
  first?: boolean;
  last?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {onMove && (
        <div className="flex shrink-0">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={first}
            className={moveBtn}
            aria-label="Move up"
          >
            &uarr;
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={last}
            className={moveBtn}
            aria-label="Move down"
          >
            &darr;
          </button>
        </div>
      )}
      <input
        value={item.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="name"
        className="md-field-dense flex-1"
      />
      <select
        value={item.mark ?? ""}
        onChange={(e) => onChange({ mark: e.target.value || undefined })}
        className="md-field-dense w-36"
      >
        <option value="">logo</option>
        {MARK_IDS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <input
        value={item.letter ?? ""}
        onChange={(e) => onChange({ letter: e.target.value || undefined })}
        placeholder="Ab"
        maxLength={2}
        className="md-field-dense w-14"
      />
      <button
        type="button"
        onClick={onRemove}
        className={removeBtn}
        aria-label="Remove"
      >
        &times;
      </button>
    </div>
  );
}

export default function WorkForm({
  initialData,
  allPosts,
  allCategories,
  allProjects,
  isEdit,
}: WorkFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [content, setContent] = useState(initialData?.content ?? "");
  // Read-only now: there is no control for it, but the value still has to
  // survive a save rather than be nulled by the form that stopped showing it.
  const [thumbnail] = useState(initialData?.thumbnail ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "draft");
  const [buildStatus, setBuildStatus] = useState(
    initialData?.buildStatus ?? "live",
  );
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [models, setModels] = useState<ProjectLogo[]>(
    initialData?.models ?? [],
  );
  const [stack, setStack] = useState<ProjectStackGroup[]>(
    initialData?.stack ?? [],
  );
  // Derived, not stored: the exact four a card will draw, recomputed on every
  // keystroke and every reorder.
  const cardPreview = cardMarks(models, stack);
  const [media, setMedia] = useState<ProjectMedia[]>(initialData?.media ?? []);
  // These render as the "by the numbers" panel on the project page. They have
  // always been real database rows; there was simply no way to edit them here,
  // which made them look hard-coded from the CMS.
  const [metrics, setMetrics] = useState<ProjectMetric[]>(
    initialData?.metrics ?? [],
  );
  const [postSlugs, setPostSlugs] = useState<string[]>(
    initialData?.postSlugs ?? [],
  );
  // Same vocabulary the posts use, so a topic means one thing across the site.
  const [categories, setCategories] = useState<string[]>(
    initialData?.categories ?? [],
  );
  const toggleCategory = (slug: string) =>
    setCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug],
    );

  const onTitle = (value: string) => {
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
  const togglePost = (s: string) =>
    setPostSlugs((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const target = isEdit ? `/api/work/${initialData?.slug}` : "/api/work";
      const res = await fetch(target, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description: description || null,
          content: content || null,
          thumbnail: thumbnail || null,
          status,
          buildStatus,
          featured,
          models,
          stack,
          media,
          metrics,
          postSlugs,
          categories,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-[760px]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="md-field-label">title</label>
          <input
            value={title}
            onChange={(e) => onTitle(e.target.value)}
            className="md-field"
            required
          />
        </div>
        <div>
          <label className="md-field-label">slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="md-field"
            required
          />
        </div>
      </div>

      <div>
        <label className="md-field-label">
          description{" "}
          <span>
            (the card on /work and the paragraph under the title — one text, no
            length limit)
          </span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="md-field !leading-6"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <label className="md-field-label">status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="md-field"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div>
          <label className="md-field-label">build</label>
          <select
            value={buildStatus}
            onChange={(e) => setBuildStatus(e.target.value)}
            className="md-field"
          >
            <option value="live">Live</option>
            <option value="wip">WIP</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="flex items-end pb-2">
          <label className="inline-flex items-center gap-2 text-[15px] text-md-on-surface">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4"
            />
            featured
          </label>
        </div>
      </div>

      {/* What a work card will actually draw, from the same function the card
          uses. The card shows four marks and then a count, and the four are
          simply the first four here: every model in order, then every stack
          item in order, deduped by name. That rule is invisible from a form
          made of two separate repeaters, so the form states it and shows the
          answer, live, as the arrows move things around. */}
      <div className="rounded-xl border border-md-outline-variant bg-md-surface-container-low p-3">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="md-field-label !mb-0">on work cards</span>
          <span className="text-[0.6875rem] text-md-on-surface-variant">
            first {MARKS_SHOWN}: models, then stack. Reorder with the arrows.
          </span>
        </div>
        {cardPreview.shown.length > 0 ? (
          <div className="flex items-center gap-3">
            <MarkRow items={cardPreview.shown} rest={cardPreview.hidden} />
            <span className="truncate text-xs text-md-on-surface-variant">
              {cardPreview.shown.map((m) => m.name).join(", ")}
            </span>
          </div>
        ) : (
          <p className="text-xs text-md-on-surface-variant">
            No models or stack items yet, so cards show no marks.
          </p>
        )}
      </div>

      {/* Models repeater */}
      <div>
        <label className="md-field-label">models</label>
        <div className="space-y-2">
          {models.map((m, i) => (
            <LogoRow
              key={i}
              item={m}
              first={i === 0}
              last={i === models.length - 1}
              onMove={(dir) => setModels((p) => move(p, i, i + dir))}
              onChange={(patch) =>
                setModels((p) =>
                  p.map((x, idx) => (idx === i ? { ...x, ...patch } : x)),
                )
              }
              onRemove={() => setModels((p) => p.filter((_, idx) => idx !== i))}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setModels((p) => [...p, { name: "" }])}
          className="md-btn md-btn-tonal md-btn-sm mt-2"
        >
          + model
        </button>
      </div>

      {/* Stack repeater (grouped) */}
      <div>
        <label className="md-field-label">
          stack <span>(grouped by layer)</span>
        </label>
        <div className="space-y-4">
          {stack.map((g, gi) => (
            <div
              key={gi}
              className="rounded-xl border border-md-outline-variant p-3"
            >
              <div className="mb-2 flex items-center gap-2">
                {/* Groups are ordered too: the card flattens them top to
                    bottom, so moving a group moves everything in it. */}
                <div className="flex shrink-0">
                  <button
                    type="button"
                    onClick={() => setStack((p) => move(p, gi, gi - 1))}
                    disabled={gi === 0}
                    className={moveBtn}
                    aria-label="Move group up"
                  >
                    &uarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => setStack((p) => move(p, gi, gi + 1))}
                    disabled={gi === stack.length - 1}
                    className={moveBtn}
                    aria-label="Move group down"
                  >
                    &darr;
                  </button>
                </div>
                <input
                  value={g.group}
                  onChange={(e) =>
                    setStack((p) =>
                      p.map((x, idx) =>
                        idx === gi ? { ...x, group: e.target.value } : x,
                      ),
                    )
                  }
                  placeholder="group (e.g. Backend)"
                  className="md-field-dense flex-1 font-medium"
                />
                <button
                  type="button"
                  onClick={() =>
                    setStack((p) => p.filter((_, idx) => idx !== gi))
                  }
                  className={removeBtn}
                  aria-label="Remove group"
                >
                  &times;
                </button>
              </div>
              <div className="space-y-2 pl-1">
                {g.items.map((it, ii) => (
                  <LogoRow
                    key={ii}
                    item={it}
                    first={ii === 0}
                    last={ii === g.items.length - 1}
                    onMove={(dir) =>
                      setStack((p) =>
                        p.map((x, idx) =>
                          idx === gi
                            ? { ...x, items: move(x.items, ii, ii + dir) }
                            : x,
                        ),
                      )
                    }
                    onChange={(patch) =>
                      setStack((p) =>
                        p.map((x, idx) =>
                          idx === gi
                            ? {
                                ...x,
                                items: x.items.map((y, j) =>
                                  j === ii ? { ...y, ...patch } : y,
                                ),
                              }
                            : x,
                        ),
                      )
                    }
                    onRemove={() =>
                      setStack((p) =>
                        p.map((x, idx) =>
                          idx === gi
                            ? {
                                ...x,
                                items: x.items.filter((_, j) => j !== ii),
                              }
                            : x,
                        ),
                      )
                    }
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setStack((p) =>
                    p.map((x, idx) =>
                      idx === gi
                        ? { ...x, items: [...x.items, { name: "" }] }
                        : x,
                    ),
                  )
                }
                className="md-btn md-btn-text md-btn-sm mt-2"
              >
                + item
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setStack((p) => [...p, { group: "", items: [] }])}
          className="md-btn md-btn-tonal md-btn-sm mt-2"
        >
          + group
        </button>
      </div>

      {/* Media repeater */}
      <div>
        <label className="md-field-label">
          media <span>(carousel; leave empty for a placeholder)</span>
        </label>
        <div className="space-y-3">
          {media.map((m, i) => (
            <div
              key={i}
              className="rounded-xl border border-md-outline-variant p-3"
            >
              <div className="flex items-center gap-2">
                <select
                  value={m.type}
                  onChange={(e) =>
                    setMedia((p) =>
                      p.map((x, idx) =>
                        idx === i
                          ? { ...x, type: e.target.value as "image" | "video" }
                          : x,
                      ),
                    )
                  }
                  className="md-field-dense w-28"
                >
                  <option value="image">image</option>
                  <option value="video">video</option>
                </select>
                <input
                  value={m.caption ?? ""}
                  onChange={(e) =>
                    setMedia((p) =>
                      p.map((x, idx) =>
                        idx === i ? { ...x, caption: e.target.value } : x,
                      ),
                    )
                  }
                  placeholder="caption"
                  className="md-field-dense flex-1"
                />
                <button
                  type="button"
                  onClick={() =>
                    setMedia((p) => p.filter((_, idx) => idx !== i))
                  }
                  className={removeBtn}
                  aria-label="Remove"
                >
                  &times;
                </button>
              </div>
              <div className="mt-2">
                <MediaPicker
                  value={m.src}
                  onChange={(v) =>
                    setMedia((p) =>
                      p.map((x, idx) => (idx === i ? { ...x, src: v } : x)),
                    )
                  }
                  label="File"
                  allowVideo
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setMedia((p) => [...p, { type: "image", src: "" }])}
          className="md-btn md-btn-tonal md-btn-sm mt-2"
        >
          + media
        </button>
      </div>

      {/* Metrics repeater. Four is what the 2x2 panel is built for; the page
          slices to four anyway, so the button stops there rather than letting
          a fifth be typed and silently dropped. */}
      <div>
        <label className="md-field-label">
          by the numbers <span>(up to 4; shown on the project page)</span>
        </label>
        <div className="space-y-2">
          {metrics.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={m.value}
                onChange={(e) =>
                  setMetrics((p) =>
                    p.map((x, idx) =>
                      idx === i ? { ...x, value: e.target.value } : x,
                    ),
                  )
                }
                placeholder="~1.5 hrs"
                className="md-field-dense w-40 shrink-0"
              />
              <input
                value={m.label}
                onChange={(e) =>
                  setMetrics((p) =>
                    p.map((x, idx) =>
                      idx === i ? { ...x, label: e.target.value } : x,
                    ),
                  )
                }
                placeholder="per SEO proposal, from about a day"
                className="md-field-dense flex-1"
              />
              <button
                type="button"
                onClick={() =>
                  setMetrics((p) => p.filter((_, idx) => idx !== i))
                }
                className="md-btn md-btn-text md-btn-sm shrink-0"
                aria-label="Remove metric"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        {metrics.length < 4 && (
          <button
            type="button"
            onClick={() => setMetrics((p) => [...p, { value: "", label: "" }])}
            className="md-btn md-btn-tonal md-btn-sm mt-2"
          >
            + metric
          </button>
        )}
      </div>

      {/* Long-form writeup (optional) */}
      <div>
        <label className="md-field-label">
          writeup <span>(optional, shown on the deep-dive)</span>
        </label>
        <RichEditor
          content={content}
          onChange={setContent}
          outputFormat="html"
        />
      </div>

      {/* No thumbnail control.
          A work item's cover comes from its first media row, which is the field
          that actually feeds the featured block and the project page. The
          separate thumbnail was null on every project and the only thing that
          ever read it was one dead fallback, so the control did nothing except
          pose as a second, competing place to set the cover. The value is still
          carried through the form untouched, so nothing is lost for any item
          that does happen to have one. */}

      {/* Topics. These are what the homepage prints above a featured project,
          in place of the old derived "Project" line, so leaving a project
          untagged is a visible choice rather than a silent one. */}
      {allCategories.length > 0 && (
        <div>
          <label className="md-field-label">topics</label>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => {
              const selected = categories.includes(cat.slug);
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => toggleCategory(cat.slug)}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[13px] leading-[18px] transition-all duration-200 ease-md-standard ${
                    selected
                      ? "border-md-secondary-container bg-md-secondary-container text-md-on-secondary-container"
                      : "border-md-outline bg-transparent text-md-on-surface-variant hover:bg-md-on-surface/8"
                  }`}
                >
                  {cat.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Backing writing */}
      {allPosts.length > 0 && (
        <div>
          <label className="md-field-label">
            related articles <span>(posts and collection parts)</span>
          </label>
          <div className="max-h-48 divide-y divide-md-outline-variant overflow-y-auto rounded-2xl border border-md-outline-variant">
            {allPosts.map((post) => (
              <button
                key={post.slug}
                type="button"
                onClick={() => togglePost(post.slug)}
                className={`w-full px-3 py-2 text-left text-[15px] leading-[22px] transition-colors ${
                  postSlugs.includes(post.slug)
                    ? "bg-md-primary/10 text-md-primary"
                    : "text-md-on-surface-variant hover:bg-md-surface-container hover:text-md-on-surface"
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
          className="md-btn md-btn-filled"
        >
          {saving ? "saving..." : isEdit ? "Update project" : "Create project"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="md-btn md-btn-outlined"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
