"use client";

import { useEffect, useState } from "react";
import RichEditor from "@/components/admin/RichEditor";
import MediaPicker from "@/components/admin/MediaPicker";
import { useToast } from "@/components/admin/Toast";

export default function AdminSettingsPage() {
  const { toast } = useToast();
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
      toast(res.ok ? "Settings saved" : "Failed to save", res.ok ? "success" : "error");
    } catch { toast("Network error", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-sm text-muted-foreground">loading...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-medium mb-6">settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section>
          <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border">site</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">title</label>
              <input type="text" value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">tagline</label>
              <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border">profile</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">name</label>
              <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">description</label>
              <RichEditor content={profileDescription} onChange={setProfileDescription} outputFormat="html" />
            </div>
            <div>
              <MediaPicker value={profileImage} onChange={setProfileImage} label="profile image" />
            </div>
          </div>
        </section>

        <button type="submit" disabled={saving}
          className="bg-primary text-primary-foreground px-6 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
          {saving ? "saving..." : "save"}
        </button>
      </form>
    </div>
  );
}
