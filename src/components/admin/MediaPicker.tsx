"use client";

import { useToast } from "@/components/admin/Toast";
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
}

export default function MediaPicker({
  value,
  onChange,
  label,
}: MediaPickerProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/media", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
        setOpen(false);
      }
    } catch {
      toast("Upload failed", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const images = items.filter((i) => {
    if (!i.mimeType?.startsWith("image/")) return false;
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
            <img src={value} alt="" className="w-full h-full object-contain" />
          </button>
        ) : (
          <div className="w-20 h-14 border border-dashed border-md-outline-variant rounded-lg flex items-center justify-center shrink-0">
            <span className="md-body-small text-md-on-surface-variant">
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
              className="w-full h-auto rounded-2xl shadow-md-4 bg-md-surface-container"
            />
            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="md-body-small font-mono text-white/70 truncate">
                {value}
              </span>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="md-body-small text-white/90 underline shrink-0"
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
          <div className="bg-md-surface-container-high rounded-2xl shadow-md-3 w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-md-outline-variant shrink-0">
              <span className="md-title-small shrink-0">Media library</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="md-field-dense flex-1"
              />
              <label className="md-btn md-btn-filled md-btn-sm cursor-pointer shrink-0">
                {uploading ? "Uploading…" : "Upload new"}
                <input
                  type="file"
                  accept="image/*"
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
                className="text-md-on-surface-variant hover:text-md-on-surface md-title-medium leading-none shrink-0"
              >
                x
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="md-body-medium text-md-on-surface-variant text-center py-10">
                  Loading…
                </div>
              ) : images.length === 0 ? (
                <div className="md-body-medium text-md-on-surface-variant text-center py-10">
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
                        <img
                          src={item.url}
                          alt={item.originalName}
                          className="w-full h-full object-cover"
                        />
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
