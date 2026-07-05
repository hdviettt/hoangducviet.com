"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/admin/Toast";

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

export default function MediaPicker({ value, onChange, label }: MediaPickerProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
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
      return i.originalName.toLowerCase().includes(q) || i.filename.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div>
      {label && (
        <label className="md-field-label">{label}</label>
      )}
      <div className="flex items-center gap-2">
        {value ? (
          <div className="relative w-20 h-14 border border-md-outline-variant bg-md-surface-container rounded-lg overflow-hidden shrink-0">
            <img src={value} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-20 h-14 border border-dashed border-md-outline-variant rounded-lg flex items-center justify-center shrink-0">
            <span className="md-body-small text-md-on-surface-variant">none</span>
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="md-btn md-btn-outlined md-btn-sm"
          >
            choose
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="md-btn md-btn-text md-btn-sm"
            >
              remove
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-md-surface-container-high rounded-2xl shadow-md-3 w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-md-outline-variant shrink-0">
              <span className="md-title-small shrink-0">media library</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="search..."
                className="md-field-dense flex-1"
              />
              <label className="md-btn md-btn-filled md-btn-sm cursor-pointer shrink-0">
                {uploading ? "uploading..." : "upload new"}
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
                onClick={() => { setOpen(false); setSearch(""); }}
                className="text-md-on-surface-variant hover:text-md-on-surface md-title-medium leading-none shrink-0"
              >
                x
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="md-body-medium text-md-on-surface-variant text-center py-10">loading...</div>
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
                        onClick={() => { onChange(item.url); setOpen(false); }}
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
