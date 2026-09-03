"use client";

import DescriptionMeter from "@/components/admin/DescriptionMeter";
import MediaPicker from "@/components/admin/MediaPicker";
import RichEditor from "@/components/admin/RichEditor";
import { useToast } from "@/components/admin/Toast";
import { MARK_IDS } from "@/components/home/logo-marks";
import type {
  ProjectFeature,
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
    tagline: string;
    description: string;
    content: string;
    thumbnail: string;
    repoUrl: string;
    liveUrl: string;
    parentSlug: string;
    status: string;
    buildStatus: string;
    featured: boolean;
    sortOrder: number;
    features: ProjectFeature[];
    stack: ProjectStackGroup[];
    models: ProjectLogo[];
    media: ProjectMedia[];
    metrics: ProjectMetric[];
    postSlugs: string[];
  };
  allPosts: Array<{ slug: string; title: string }>;
  allProjects: Array<{ slug: string; title: string }>;
  isEdit?: boolean;
}

const removeBtn =
  "shrink-0 h-8 w-8 inline-flex items-center justify-center rounded-lg text-md-on-surface-variant hover:bg-md-error/10 hover:text-md-error";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-2 text-[13px] font-medium text-md-on-surface">
      {children}
    </div>
  );
}

// Shared editor for a single {name, mark?, letter?} logo chip.
function LogoRow({
  item,
  onChange,
  onRemove,
}: {
  item: ProjectLogo;
  onChange: (patch: Partial<ProjectLogo>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
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
      <button type="button" onClick={onRemove} className={removeBtn} aria-label="Remove">
        &times;
      </button>
    </div>
  );
}

export default function WorkForm({
  initialData,
  allPosts,
  allProjects,
  isEdit,
}: WorkFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [tagline, setTagline] = useState(initialData?.tagline ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail ?? "");
  const [repoUrl, setRepoUrl] = useState(initialData?.repoUrl ?? "");
  const [liveUrl, setLiveUrl] = useState(initialData?.liveUrl ?? "");
  const [parentSlug, setParentSlug] = useState(initialData?.parentSlug ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "draft");
  const [buildStatus, setBuildStatus] = useState(initialData?.buildStatus ?? "live");
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [sortOrder, setSortOrder] = useState(String(initialData?.sortOrder ?? 0));
  const [features, setFeatures] = useState<ProjectFeature[]>(initialData?.features ?? []);
  const [models, setModels] = useState<ProjectLogo[]>(initialData?.models ?? []);
  const [stack, setStack] = useState<ProjectStackGroup[]>(initialData?.stack ?? []);
  const [media, setMedia] = useState<ProjectMedia[]>(initialData?.media ?? []);
  const [metrics, setMetrics] = useState<ProjectMetric[]>(initialData?.metrics ?? []);
  const [postSlugs, setPostSlugs] = useState<string[]>(initialData?.postSlugs ?? []);

  const onTitle = (value: string) => {
    setTitle(value);
    if (!isEdit) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
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
          tagline: tagline || null,
          description: description || null,
          content: content || null,
          thumbnail: thumbnail || null,
          repoUrl: repoUrl || null,
          liveUrl: liveUrl || null,
          parentSlug: parentSlug || null,
          status,
          buildStatus,
          featured,
          sortOrder,
          features,
          models,
          stack,
          media,
          metrics,
          postSlugs,
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
          <input value={title} onChange={(e) => onTitle(e.target.value)} className="md-field" required />
        </div>
        <div>
          <label className="md-field-label">slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="md-field" required />
        </div>
      </div>

      <div>
        <label className="md-field-label">tagline <span>(one-liner on the /work card)</span></label>
        <textarea value={tagline} onChange={(e) => setTagline(e.target.value)} rows={2} className="md-field !leading-6" />
        <DescriptionMeter value={tagline} />
      </div>

      <div>
        <label className="md-field-label">description <span>(paragraph under the showcase title)</span></label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="md-field !leading-6" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <label className="md-field-label">status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="md-field">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div>
          <label className="md-field-label">build</label>
          <select value={buildStatus} onChange={(e) => setBuildStatus(e.target.value)} className="md-field">
            <option value="live">Live</option>
            <option value="wip">WIP</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div>
          <label className="md-field-label">sort order</label>
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="md-field" />
        </div>
        <div className="flex items-end pb-2">
          <label className="inline-flex items-center gap-2 text-[15px] text-md-on-surface">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4" />
            featured
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="md-field-label">repo url</label>
          <input type="url" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/..." className="md-field" />
        </div>
        <div>
          <label className="md-field-label">live url</label>
          <input type="url" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://..." className="md-field" />
        </div>
      </div>

      <div>
        <label className="md-field-label">
          parent project <span>(nest this under another project)</span>
        </label>
        <select
          value={parentSlug}
          onChange={(e) => setParentSlug(e.target.value)}
          className="md-field"
        >
          <option value="">No parent (top level)</option>
          {allProjects
            .filter((p) => p.slug !== slug)
            .map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title}
              </option>
            ))}
        </select>
      </div>

      {/* Features repeater */}
      <div>
        <label className="md-field-label">features <span>(the pipeline / capabilities)</span></label>
        <div className="space-y-2">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-2">
              <input
                value={f.name}
                onChange={(e) => setFeatures((p) => p.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))}
                placeholder="name"
                className="md-field-dense w-40 shrink-0"
              />
              <input
                value={f.desc}
                onChange={(e) => setFeatures((p) => p.map((x, idx) => (idx === i ? { ...x, desc: e.target.value } : x)))}
                placeholder="one-line description"
                className="md-field-dense flex-1"
              />
              <button type="button" onClick={() => setFeatures((p) => p.filter((_, idx) => idx !== i))} className={removeBtn} aria-label="Remove">
                &times;
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setFeatures((p) => [...p, { name: "", desc: "" }])} className="md-btn md-btn-tonal md-btn-sm mt-2">
          + feature
        </button>
      </div>

      {/* Metrics repeater */}
      <div>
        <label className="md-field-label">metrics <span>(the "by the numbers" band on the deep-dive)</span></label>
        <div className="space-y-2">
          {metrics.map((m, i) => (
            <div key={i} className="flex items-start gap-2">
              <input
                value={m.value}
                onChange={(e) => setMetrics((p) => p.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)))}
                placeholder="0.74"
                className="md-field-dense w-32 shrink-0 font-mono"
              />
              <input
                value={m.label}
                onChange={(e) => setMetrics((p) => p.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))}
                placeholder="what it measures"
                className="md-field-dense flex-1"
              />
              <button type="button" onClick={() => setMetrics((p) => p.filter((_, idx) => idx !== i))} className={removeBtn} aria-label="Remove">
                &times;
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setMetrics((p) => [...p, { value: "", label: "" }])} className="md-btn md-btn-tonal md-btn-sm mt-2">
          + metric
        </button>
      </div>

      {/* Models repeater */}
      <div>
        <label className="md-field-label">models</label>
        <div className="space-y-2">
          {models.map((m, i) => (
            <LogoRow
              key={i}
              item={m}
              onChange={(patch) => setModels((p) => p.map((x, idx) => (idx === i ? { ...x, ...patch } : x)))}
              onRemove={() => setModels((p) => p.filter((_, idx) => idx !== i))}
            />
          ))}
        </div>
        <button type="button" onClick={() => setModels((p) => [...p, { name: "" }])} className="md-btn md-btn-tonal md-btn-sm mt-2">
          + model
        </button>
      </div>

      {/* Stack repeater (grouped) */}
      <div>
        <label className="md-field-label">stack <span>(grouped by layer)</span></label>
        <div className="space-y-4">
          {stack.map((g, gi) => (
            <div key={gi} className="rounded-xl border border-md-outline-variant p-3">
              <div className="mb-2 flex items-center gap-2">
                <input
                  value={g.group}
                  onChange={(e) => setStack((p) => p.map((x, idx) => (idx === gi ? { ...x, group: e.target.value } : x)))}
                  placeholder="group (e.g. Backend)"
                  className="md-field-dense flex-1 font-medium"
                />
                <button type="button" onClick={() => setStack((p) => p.filter((_, idx) => idx !== gi))} className={removeBtn} aria-label="Remove group">
                  &times;
                </button>
              </div>
              <div className="space-y-2 pl-1">
                {g.items.map((it, ii) => (
                  <LogoRow
                    key={ii}
                    item={it}
                    onChange={(patch) =>
                      setStack((p) =>
                        p.map((x, idx) =>
                          idx === gi
                            ? { ...x, items: x.items.map((y, j) => (j === ii ? { ...y, ...patch } : y)) }
                            : x,
                        ),
                      )
                    }
                    onRemove={() =>
                      setStack((p) => p.map((x, idx) => (idx === gi ? { ...x, items: x.items.filter((_, j) => j !== ii) } : x)))
                    }
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStack((p) => p.map((x, idx) => (idx === gi ? { ...x, items: [...x.items, { name: "" }] } : x)))}
                className="md-btn md-btn-text md-btn-sm mt-2"
              >
                + item
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setStack((p) => [...p, { group: "", items: [] }])} className="md-btn md-btn-tonal md-btn-sm mt-2">
          + group
        </button>
      </div>

      {/* Media repeater */}
      <div>
        <label className="md-field-label">media <span>(carousel; leave empty for a placeholder)</span></label>
        <div className="space-y-3">
          {media.map((m, i) => (
            <div key={i} className="rounded-xl border border-md-outline-variant p-3">
              <div className="flex items-center gap-2">
                <select
                  value={m.type}
                  onChange={(e) => setMedia((p) => p.map((x, idx) => (idx === i ? { ...x, type: e.target.value as "image" | "video" } : x)))}
                  className="md-field-dense w-28"
                >
                  <option value="image">image</option>
                  <option value="video">video</option>
                </select>
                <input
                  value={m.caption ?? ""}
                  onChange={(e) => setMedia((p) => p.map((x, idx) => (idx === i ? { ...x, caption: e.target.value } : x)))}
                  placeholder="caption"
                  className="md-field-dense flex-1"
                />
                <button type="button" onClick={() => setMedia((p) => p.filter((_, idx) => idx !== i))} className={removeBtn} aria-label="Remove">
                  &times;
                </button>
              </div>
              <div className="mt-2">
                <MediaPicker
                  value={m.src}
                  onChange={(v) => setMedia((p) => p.map((x, idx) => (idx === i ? { ...x, src: v } : x)))}
                  label="File"
                />
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setMedia((p) => [...p, { type: "image", src: "" }])} className="md-btn md-btn-tonal md-btn-sm mt-2">
          + media
        </button>
      </div>

      {/* Long-form writeup (optional) */}
      <div>
        <label className="md-field-label">writeup <span>(optional, shown on the deep-dive)</span></label>
        <RichEditor content={content} onChange={setContent} outputFormat="html" />
      </div>

      {/* Thumbnail */}
      <MediaPicker value={thumbnail} onChange={setThumbnail} label="Thumbnail" />

      {/* Backing writing */}
      {allPosts.length > 0 && (
        <div>
          <label className="md-field-label">backing writing <span>(posts and series parts)</span></label>
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
        <button type="submit" disabled={saving} className="md-btn md-btn-filled">
          {saving ? "saving..." : isEdit ? "Update project" : "Create project"}
        </button>
        <button type="button" onClick={() => router.back()} className="md-btn md-btn-outlined">
          Cancel
        </button>
      </div>
    </form>
  );
}
