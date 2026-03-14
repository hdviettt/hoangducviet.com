"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/admin/Toast";

interface MediaItem {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string | null;
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

  const select = (filename: string) => {
    onChange(`/uploads/${filename}`);
    setOpen(false);
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
        <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      )}
      <div className="flex items-center gap-2">
        {value ? (
          <div className="relative w-20 h-14 border border-border bg-muted overflow-hidden shrink-0">
            <img src={value} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-20 h-14 border border-dashed border-border flex items-center justify-center shrink-0">
            <span className="text-xs text-muted-foreground">none</span>
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="px-3 py-1.5 text-xs border border-border hover:border-primary hover:text-primary transition-colors"
          >
            choose
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              remove
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-background border border-border w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
              <span className="text-sm font-medium shrink-0">media library</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="search..."
                className="bg-background border border-border px-2 py-1 text-xs focus:outline-none focus:border-primary flex-1"
              />
              <label className="bg-primary text-primary-foreground px-3 py-1 text-xs hover:opacity-90 cursor-pointer shrink-0">
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
                className="text-muted-foreground hover:text-foreground text-lg leading-none shrink-0"
              >
                x
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-sm text-muted-foreground text-center py-10">loading...</div>
              ) : images.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-10">
                  no images yet. upload one above.
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {images.map((item) => {
                    const url = `/uploads/${item.filename}`;
                    const isSelected = value === url;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => select(item.filename)}
                        className={`aspect-square border overflow-hidden transition-all ${
                          isSelected
                            ? "border-primary ring-2 ring-primary"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        <img
                          src={url}
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
