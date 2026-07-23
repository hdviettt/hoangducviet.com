"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";

// Authoring UI for the `widget:carousel` fence. Serialises to exactly the
// fence the public renderer already understands, so stored content and
// published output are identical to a hand-written one — this only replaces
// editing raw JSON in a textarea.

interface Slide {
  src: string;
  caption?: string;
  alt?: string;
  poster?: string;
}

interface MediaItem {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string | null;
  url: string;
}

const VIDEO_EXT = /\.(mp4|webm|ogv|mov|m4v)(\?|#|$)/i;
const isVideo = (src: string) => VIDEO_EXT.test(src);

const RATIOS = [
  { value: "16 / 9", label: "16:9 — widescreen" },
  { value: "1200 / 630", label: "1200×630 — cover art" },
  { value: "3 / 2", label: "3:2" },
  { value: "4 / 3", label: "4:3" },
  { value: "1 / 1", label: "1:1 — square" },
];

const MATS = [
  { value: "brand", label: "Brand wash" },
  { value: "ambient", label: "Ambient (blur the slide)" },
  { value: "flat", label: "Flat" },
];

const parseSlides = (raw: string): Slide[] => {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

// Reduce a pixel size to its simplest ratio so "match slide 1" writes
// "16 / 9" rather than "1920 / 1080".
const simplify = (w: number, h: number) => {
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const d = gcd(Math.round(w), Math.round(h)) || 1;
  return `${Math.round(w) / d} / ${Math.round(h) / d}`;
};

// --- Media library, multi-select ---------------------------------------

function LibraryModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (urls: string[]) => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<string[]>([]);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/media");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of files) {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/media", { method: "POST", body });
      if (res.ok) urls.push((await res.json()).url);
    }
    setUploading(false);
    e.target.value = "";
    if (urls.length) {
      // Straight in: someone who just uploaded five clips means to use them.
      onAdd(urls);
      onClose();
    }
  };

  const visible = items.filter((i) => {
    const usable =
      i.mimeType?.startsWith("image/") || i.mimeType?.startsWith("video/");
    if (!usable) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      i.originalName.toLowerCase().includes(q) ||
      i.filename.toLowerCase().includes(q)
    );
  });

  const toggle = (url: string) =>
    setPicked((p) =>
      p.includes(url) ? p.filter((u) => u !== url) : [...p, url],
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-md-scrim/40">
      <div className="bg-md-surface-container-high rounded-2xl shadow-md-3 w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-md-outline-variant shrink-0">
          <span className="text-[15px] leading-[22px] font-medium shrink-0">
            Add slides
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Search…"
            className="md-field-dense flex-1"
          />
          <label className="md-btn md-btn-outlined md-btn-sm cursor-pointer shrink-0">
            {uploading ? "Uploading…" : "Upload"}
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={upload}
              className="hidden"
              disabled={uploading}
            />
          </label>
          <button
            type="button"
            onClick={onClose}
            className="text-md-on-surface-variant hover:text-md-on-surface text-[17px] leading-6 font-medium tracking-tight leading-none shrink-0"
          >
            x
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-[15px] leading-[22px] text-md-on-surface-variant text-center py-10">
              Loading…
            </div>
          ) : visible.length === 0 ? (
            <div className="text-[15px] leading-[22px] text-md-on-surface-variant text-center py-10">
              Nothing here yet. Upload above.
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {visible.map((item) => {
                const n = picked.indexOf(item.url);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item.url)}
                    className={`relative aspect-square border rounded-xl overflow-hidden transition-all ${
                      n >= 0
                        ? "border-md-primary ring-2 ring-md-primary"
                        : "border-md-outline-variant hover:border-md-primary"
                    }`}
                  >
                    {isVideo(item.url) ? (
                      <div className="w-full h-full flex items-center justify-center bg-md-surface-container-highest text-[13px] leading-[18px] text-md-on-surface-variant px-2 text-center break-all">
                        {item.originalName}
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.originalName}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {n >= 0 && (
                      <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-md-primary text-md-on-primary text-[12px] leading-4 flex items-center justify-center">
                        {n + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-md-outline-variant shrink-0">
          <span className="text-[13px] leading-[18px] text-md-on-surface-variant">
            {picked.length
              ? `${picked.length} selected — they are added in click order`
              : "Click to select, in the order you want them"}
          </span>
          <button
            type="button"
            disabled={!picked.length}
            onClick={() => {
              onAdd(picked);
              onClose();
            }}
            className="md-btn md-btn-filled md-btn-sm disabled:opacity-40"
          >
            add {picked.length || ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- NodeView ----------------------------------------------------------

function CarouselView({ node, updateAttributes, deleteNode, selected }: any) {
  const slides: Slide[] = parseSlides(node.attrs.items);
  const ratio: string = node.attrs.ratio || "16 / 9";
  const mat: string = node.attrs.mat || "brand";
  const [library, setLibrary] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const firstImg = useRef<HTMLImageElement>(null);

  const write = (next: Slide[]) =>
    updateAttributes({ items: JSON.stringify(next) });

  const patch = (i: number, p: Partial<Slide>) =>
    write(slides.map((s, n) => (n === i ? { ...s, ...p } : s)));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= slides.length || from === to) return;
    const next = slides.slice();
    const [s] = next.splice(from, 1);
    next.splice(to, 0, s);
    write(next);
  };

  // The one real footgun is a ratio that does not match the artwork, so offer
  // to read it off the first slide rather than making someone guess.
  const matchFirst = () => {
    const el = firstImg.current;
    if (!el?.naturalWidth || !el.naturalHeight) return;
    updateAttributes({ ratio: simplify(el.naturalWidth, el.naturalHeight) });
  };

  const known = RATIOS.some((r) => r.value === ratio);

  return (
    <NodeViewWrapper
      className={`my-5 not-prose rounded-xl border ${
        selected
          ? "border-md-primary ring-1 ring-md-primary"
          : "border-md-outline-variant"
      } bg-transparent overflow-hidden`}
      contentEditable={false}
    >
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-md-outline-variant bg-md-surface-container">
        <span className="text-[14px] leading-5">
          Carousel · {slides.length} slide{slides.length === 1 ? "" : "s"}
        </span>
        <div className="flex-1" />

        <select
          value={known ? ratio : "__custom"}
          onChange={(e) => updateAttributes({ ratio: e.target.value })}
          onMouseDown={(e) => e.stopPropagation()}
          className="md-field-dense"
          title="Every slide is normalised to this shape"
        >
          {RATIOS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
          {!known && <option value="__custom">{ratio}</option>}
        </select>

        <button
          type="button"
          onClick={matchFirst}
          disabled={!slides.length || isVideo(slides[0]?.src || "")}
          className="md-btn md-btn-text md-btn-sm disabled:opacity-40"
          title="Read the ratio off the first slide so nothing letterboxes"
        >
          match slide 1
        </button>

        <select
          value={mat}
          onChange={(e) => updateAttributes({ mat: e.target.value })}
          onMouseDown={(e) => e.stopPropagation()}
          className="md-field-dense"
          title="What fills the canvas when a slide does not match the ratio"
        >
          {MATS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => deleteNode()}
          className="md-btn md-btn-text md-btn-sm text-md-error"
        >
          Delete
        </button>
      </div>

      {slides.length === 0 ? (
        <button
          type="button"
          onClick={() => setLibrary(true)}
          className="w-full py-10 text-[15px] leading-[22px] text-md-on-surface-variant hover:text-md-primary"
        >
          + add slides
        </button>
      ) : (
        <div className="flex gap-3 overflow-x-auto p-3">
          {slides.map((s, i) => (
            <div
              key={`${s.src}-${i}`}
              draggable
              onDragStart={() => setDragFrom(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragFrom !== null) move(dragFrom, i);
                setDragFrom(null);
              }}
              className={`w-52 shrink-0 rounded-lg border bg-md-surface p-2 ${
                dragFrom === i
                  ? "border-md-primary opacity-60"
                  : "border-md-outline-variant"
              }`}
            >
              <div
                className="relative w-full rounded-md overflow-hidden bg-md-surface-container-highest"
                style={{ aspectRatio: ratio }}
              >
                {isVideo(s.src) ? (
                  <div className="absolute inset-0 flex items-center justify-center text-[13px] leading-[18px] text-md-on-surface-variant px-2 text-center break-all">
                    {s.src.split("/").pop()}
                  </div>
                ) : (
                  <img
                    ref={i === 0 ? firstImg : undefined}
                    src={s.src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                )}
                <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-md-scrim/60 text-white text-[12px] leading-4 flex items-center justify-center">
                  {i + 1}
                </span>
              </div>

              <input
                type="text"
                value={s.caption || ""}
                placeholder="Caption"
                onChange={(e) => patch(i, { caption: e.target.value })}
                onKeyDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="md-field-dense w-full mt-2"
              />

              <div className="flex items-center gap-1 mt-1">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  className="md-btn md-btn-text md-btn-sm disabled:opacity-30"
                  title="Move left"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === slides.length - 1}
                  className="md-btn md-btn-text md-btn-sm disabled:opacity-30"
                  title="Move right"
                >
                  ›
                </button>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => write(slides.filter((_, n) => n !== i))}
                  className="md-btn md-btn-text md-btn-sm text-md-error"
                  title="Remove slide"
                >
                  ×
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setLibrary(true)}
            className="w-32 shrink-0 rounded-lg border border-dashed border-md-outline-variant text-[13px] leading-[18px] text-md-on-surface-variant hover:border-md-primary hover:text-md-primary"
          >
            + add
          </button>
        </div>
      )}

      {library && (
        <LibraryModal
          onClose={() => setLibrary(false)}
          onAdd={(urls) => write([...slides, ...urls.map((src) => ({ src }))])}
        />
      )}
    </NodeViewWrapper>
  );
}

// --- Node --------------------------------------------------------------

export const CarouselEmbed = Node.create({
  name: "carouselEmbed",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      items: { default: "[]" },
      ratio: { default: "16 / 9" },
      mat: { default: "brand" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-carousel-embed]",
        getAttrs: (el: HTMLElement) => ({
          items: el.getAttribute("data-items") || "[]",
          ratio: el.getAttribute("data-ratio") || "16 / 9",
          mat: el.getAttribute("data-mat") || "brand",
        }),
      },
    ];
  },

  renderHTML({ node }) {
    return [
      "div",
      mergeAttributes({
        "data-carousel-embed": "",
        "data-items": node.attrs.items,
        "data-ratio": node.attrs.ratio,
        "data-mat": node.attrs.mat,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CarouselView);
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          const items = parseSlides(node.attrs.items);
          const body: Record<string, unknown> = {};
          // Only spell out what differs from the renderer's defaults, so a
          // plain carousel stays as readable as a hand-written one.
          if (node.attrs.ratio && node.attrs.ratio !== "16 / 9") {
            body.ratio = node.attrs.ratio;
          }
          if (node.attrs.mat && node.attrs.mat !== "brand") {
            body.mat = node.attrs.mat;
          }
          const payload = Object.keys(body).length ? { ...body, items } : items;
          const fence = "```";
          state.write(
            `${fence}widget:carousel\n${JSON.stringify(payload, null, 2)}\n${fence}`,
          );
          state.closeBlock(node);
        },
        parse: {},
      },
    };
  },
});

// --- Markdown preprocessing --------------------------------------------

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Turns a stored fence into the <div data-carousel-embed> that parseHTML
// materialises, so opening an existing post shows the editor instead of raw
// JSON. Malformed fences are left untouched and still render as a code block.
export function preprocessCarouselInMarkdown(markdown: string): string {
  return markdown.replace(
    /```widget:carousel\s*\n([\s\S]*?)\n```/g,
    (whole, json) => {
      try {
        const parsed = JSON.parse(String(json).trim());
        const items = Array.isArray(parsed) ? parsed : parsed?.items;
        if (!Array.isArray(items)) return whole;
        const ratio = (!Array.isArray(parsed) && parsed?.ratio) || "16 / 9";
        const mat = (!Array.isArray(parsed) && parsed?.mat) || "brand";
        return `<div data-carousel-embed data-items="${escapeAttr(
          JSON.stringify(items),
        )}" data-ratio="${escapeAttr(String(ratio))}" data-mat="${escapeAttr(
          String(mat),
        )}"></div>`;
      } catch {
        return whole;
      }
    },
  );
}
