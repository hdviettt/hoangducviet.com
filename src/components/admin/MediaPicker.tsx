"use client";

import { useToast } from "@/components/admin/Toast";
import { MAX_UPLOAD_LABEL, formatBytes, tooLarge } from "@/lib/upload-limits";
import { useCallback, useEffect, useState } from "react";

interface MediaItem {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string | null;
  url: string;
}

interface MediaPickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  /**
   * Let this picker upload and choose video as well as images.
   *
   * Off by default on purpose: most call sites are thumbnails and og images,
   * and a thumbnail that is an mp4 is a broken card. Only the media rows on a
   * work item — the ones with an image/video type select next to them — set it.
   */
  allowVideo?: boolean;
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i;
const isVideoUrl = (u: string) => VIDEO_EXT.test(u);

/**
 * POST one file to /api/media, reporting how much of it has gone out.
 *
 * XMLHttpRequest rather than fetch, for the one thing fetch cannot do: report
 * upload progress. `fetch` has no equivalent of `xhr.upload.onprogress`, and
 * without it a large upload is a word on a button and nothing else.
 *
 * Rejects with the server's own message so the caller can show it.
 */
function postFile(
  file: File,
  onProgress: (pct: number) => void,
): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/media");
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) {
        onProgress(Math.round((ev.loaded / ev.total) * 100));
      }
    };
    xhr.onload = () => {
      let body: { url?: string; error?: string } | null = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300 && body?.url) {
        resolve(body as { url: string });
      } else {
        reject(new Error(body?.error || `Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed: network error"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));
    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  });
}

export default function MediaPicker({
  value,
  onChange,
  label,
  allowVideo = false,
}: MediaPickerProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  // null while idle, 0-100 while a file is going up. A number, not a word:
  // a 20 MB file on a 3 Mbps uplink is 84 seconds, measured, and 84 seconds of
  // the static word "Uploading…" is indistinguishable from a hang. It is what
  // made a slow upload and a broken one look the same.
  const [progress, setProgress] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/media");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) fetchMedia();
  }, [open, fetchMedia]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Refuse it here, before a byte goes out. The route rejects on
    // `content-length` without reading the body, and a browser that sends
    // anyway never gets its request drained: the upload hangs and the button
    // sticks on "Uploading…" for good. See lib/upload-limits.ts.
    if (tooLarge(file.size)) {
      toast(
        `That file is ${formatBytes(file.size)}. The limit is ${MAX_UPLOAD_LABEL}, so compress it or trim the clip.`,
        "error",
      );
      e.target.value = "";
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const data = await postFile(file, setProgress);
      onChange(data.url);
      setOpen(false);
    } catch (err) {
      // Every failure says something now. This used to be `if (res.ok)` with
      // no else, so a 413, a 401 or a 500 all did nothing at all: the modal
      // stayed open, the button went back to "Upload new", and nothing on
      // screen said the file had not been saved.
      toast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
      setProgress(null);
      e.target.value = "";
    }
  };

  const images = items.filter((i) => {
    const mime = i.mimeType || "";
    const ok =
      mime.startsWith("image/") ||
      (allowVideo && (mime.startsWith("video/") || isVideoUrl(i.filename)));
    if (!ok) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        i.originalName.toLowerCase().includes(q) ||
        i.filename.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      {label && <label className="md-field-label">{label}</label>}
      <div className="flex items-center gap-2">
        {value ? (
          // object-contain, not cover: a 1200x630 cover cropped to a 80x56 box
          // hides the composition. Click opens it at full size, which is the
          // only way to review a cover that lives in /public and therefore
          // never appears in the uploaded media library.
          <button
            type="button"
            onClick={() => setPreview(true)}
            title="View full size"
            className="relative w-28 h-20 border border-md-outline-variant bg-md-surface-container rounded-lg overflow-hidden shrink-0 hover:border-md-primary transition-colors"
          >
            {isVideoUrl(value) ? (
              <video
                src={value}
                muted
                playsInline
                preload="metadata"
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={value}
                alt=""
                className="w-full h-full object-contain"
              />
            )}
          </button>
        ) : (
          <div className="w-20 h-14 border border-dashed border-md-outline-variant rounded-lg flex items-center justify-center shrink-0">
            <span className="text-[13px] leading-[18px] text-md-on-surface-variant">
              None
            </span>
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="md-btn md-btn-outlined md-btn-sm"
          >
            Choose
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="md-btn md-btn-text md-btn-sm"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Full-size preview. SVG covers animate here, so this doubles as the
          only place to check an animated cover before publishing. */}
      {preview && value && (
        <button
          type="button"
          aria-label="Close preview"
          onClick={() => setPreview(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-md-scrim/70 p-6"
        >
          <div className="w-full max-w-4xl">
            <img
              src={value}
              alt=""
              className="w-full h-auto rounded-2xl ring-1 ring-md-outline-variant bg-md-surface-container"
            />
            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="text-[13px] leading-[18px] font-mono text-white/70 truncate">
                {value}
              </span>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[13px] leading-[18px] text-white/90 underline shrink-0"
              >
                open in new tab
              </a>
            </div>
          </div>
        </button>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-md-scrim/40">
          <div className="bg-md-surface-container-high rounded-2xl ring-1 ring-md-outline-variant w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-md-outline-variant shrink-0">
              <span className="text-[15px] leading-[22px] font-medium shrink-0">
                Media library
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="md-field-dense flex-1"
              />
              <label className="md-btn md-btn-filled md-btn-sm cursor-pointer shrink-0">
                {uploading
                  ? progress === null || progress === 100
                    ? "Saving…"
                    : `Uploading ${progress}%`
                  : "Upload new"}
                <input
                  type="file"
                  accept={allowVideo ? "image/*,video/*" : "image/*"}
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setSearch("");
                }}
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
              ) : images.length === 0 ? (
                <div className="text-[15px] leading-[22px] text-md-on-surface-variant text-center py-10">
                  no images yet. upload one above.
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {images.map((item) => {
                    const isSelected = value === item.url;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onChange(item.url);
                          setOpen(false);
                        }}
                        className={`aspect-square border rounded-xl overflow-hidden transition-all ${
                          isSelected
                            ? "border-md-primary ring-2 ring-md-primary"
                            : "border-md-outline-variant hover:border-md-primary"
                        }`}
                      >
                        {isVideoUrl(item.filename) ||
                        item.mimeType?.startsWith("video/") ? (
                          <video
                            src={item.url}
                            muted
                            playsInline
                            preload="metadata"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          // Lazy, because this grid is the whole library at
                          // full size. Measured on production: opening the
                          // picker fired 273 requests and pulled 125 MB in
                          // thirty seconds, with 22 still in flight — 249
                          // images at an average of 661 KB, eight of them
                          // animated GIFs over 5 MB. It is not what made an
                          // upload hang, but it did roughly double how long
                          // one took: 8 MB went up in 39s against the 21s the
                          // uplink alone accounts for.
                          <img
                            src={item.url}
                            alt={item.originalName}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
