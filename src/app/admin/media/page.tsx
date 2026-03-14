"use client";

import { useEffect, useState } from "react";

interface MediaItem {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string | null;
  size: number | null;
  uploadedAt: string;
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchMedia = async () => {
    const res = await fetch("/api/media");
    if (res.ok) {
      setItems(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        fetchMedia();
      }
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: number, filename: string) => {
    if (!confirm(`Delete "${filename}"?`)) return;
    const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchMedia();
    }
  };

  const copyPath = (filename: string) => {
    navigator.clipboard.writeText(`/uploads/${filename}`);
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">Media</h1>
        <label className="bg-primary text-primary-foreground px-4 py-2 text-sm uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer">
          {uploading ? "Uploading..." : "Upload"}
          <input
            type="file"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="border border-border">
            {item.mimeType?.startsWith("image/") && (
              <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                <img
                  src={`/uploads/${item.filename}`}
                  alt={item.originalName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-3">
              <p className="text-sm truncate">{item.originalName}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {item.size ? `${(item.size / 1024).toFixed(1)} KB` : ""}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => copyPath(item.filename)}
                  className="text-xs text-primary hover:underline"
                >
                  Copy path
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.originalName)}
                  className="text-xs text-destructive hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center py-8 text-sm text-muted-foreground">
            No media uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
}
