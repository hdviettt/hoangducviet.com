"use client";

import { useEffect, useState } from "react";

interface MediaItem {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string | null;
  size: number | null;
}

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
    const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
    if (res.ok) fetchMedia();
  };

  const copyPath = (filename: string) => {
    navigator.clipboard.writeText(`/uploads/${filename}`);
  };

  if (loading) return <div className="text-[#666]">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-white">Media</h1>
        <label className="admin-btn cursor-pointer">
          {uploading ? "Uploading..." : "Upload"}
          <input type="file" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="admin-card p-0 overflow-hidden">
            {item.mimeType?.startsWith("image/") && (
              <div className="aspect-video bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                <img
                  src={`/uploads/${item.filename}`}
                  alt={item.originalName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-3">
              <p className="text-xs text-[#aaa] truncate">{item.originalName}</p>
              <p className="text-xs text-[#555] mt-0.5">
                {item.size ? `${(item.size / 1024).toFixed(1)} KB` : ""}
              </p>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => copyPath(item.filename)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Copy path
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.originalName)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center py-10 text-sm text-[#666]">
            No media uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
}
