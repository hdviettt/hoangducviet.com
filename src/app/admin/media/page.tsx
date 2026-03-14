"use client";

import { useEffect, useState } from "react";

interface MediaItem { id: number; filename: string; originalName: string; mimeType: string | null; size: number | null; }

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchMedia = async () => {
    const res = await fetch("/api/media");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/media", { method: "POST", body: formData });
      if (res.ok) fetchMedia();
    } catch { alert("Upload failed"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await fetch(`/api/media/${id}`, { method: "DELETE" });
    fetchMedia();
  };

  const copyPath = (filename: string) => navigator.clipboard.writeText(`/uploads/${filename}`);

  if (loading) return <div className="text-sm text-muted-foreground">loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium">media</h1>
        <label className="bg-primary text-primary-foreground px-4 py-1.5 text-sm hover:opacity-90 cursor-pointer">
          {uploading ? "uploading..." : "upload"}
          <input type="file" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {items.map((item) => (
          <div key={item.id} className="border border-border overflow-hidden">
            {item.mimeType?.startsWith("image/") && (
              <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                <img src={`/uploads/${item.filename}`} alt={item.originalName} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-2">
              <p className="text-xs truncate">{item.originalName}</p>
              <div className="flex gap-2 mt-1.5">
                <button type="button" onClick={() => copyPath(item.filename)} className="text-xs text-primary hover:underline">copy</button>
                <button type="button" onClick={() => handleDelete(item.id, item.originalName)} className="text-xs text-destructive hover:underline">delete</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center py-10 text-sm text-muted-foreground">no media yet.</div>
        )}
      </div>
    </div>
  );
}
