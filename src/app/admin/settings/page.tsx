"use client";

import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siteTitle, setSiteTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileDescription, setProfileDescription] = useState("");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.global) { setSiteTitle(data.global.title || ""); setTagline(data.global.tagline || ""); }
        if (data.profile) { setProfileName(data.profile.name || ""); setProfileDescription(data.profile.description || ""); setProfileImage(data.profile.image || ""); }
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          global: { title: siteTitle, tagline },
          profile: { name: profileName, description: profileDescription, image: profileImage },
        }),
      });
      if (res.ok) alert("Saved"); else alert("Failed to save");
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-[#666]">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-8">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-xl">
        <section className="admin-card space-y-4">
          <h2 className="text-sm font-semibold text-[#aaa] mb-4">Site</h2>
          <div>
            <label className="block text-xs text-[#888] mb-1.5">Title</label>
            <input type="text" value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="block text-xs text-[#888] mb-1.5">Tagline</label>
            <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className="admin-input" />
          </div>
        </section>

        <section className="admin-card space-y-4">
          <h2 className="text-sm font-semibold text-[#aaa] mb-4">Profile</h2>
          <div>
            <label className="block text-xs text-[#888] mb-1.5">Name</label>
            <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="block text-xs text-[#888] mb-1.5">Description (HTML)</label>
            <textarea value={profileDescription} onChange={(e) => setProfileDescription(e.target.value)} className="admin-input min-h-[120px] resize-y" />
          </div>
          <div>
            <label className="block text-xs text-[#888] mb-1.5">Profile Image URL</label>
            <input type="text" value={profileImage} onChange={(e) => setProfileImage(e.target.value)} className="admin-input" placeholder="/uploads/profile.jpg" />
          </div>
        </section>

        <button type="submit" disabled={saving} className="admin-btn">
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
