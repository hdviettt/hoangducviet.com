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
  const [featuredSeriesSlug, setFeaturedSeriesSlug] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileDescription, setProfileDescription] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profileHeadline, setProfileHeadline] = useState("");
  const [profileAboutHtml, setProfileAboutHtml] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.global) { setSiteTitle(data.global.title || ""); setTagline(data.global.tagline || ""); setFeaturedSeriesSlug(data.global.featuredSeriesSlug || ""); }
        if (data.profile) { setProfileName(data.profile.name || ""); setProfileDescription(data.profile.description || ""); setProfileImage(data.profile.image || ""); setProfileHeadline(data.profile.headline || ""); setProfileAboutHtml(data.profile.aboutHtml || ""); }
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
          global: { title: siteTitle, tagline, featuredSeriesSlug },
          profile: { name: profileName, description: profileDescription, image: profileImage, headline: profileHeadline, aboutHtml: profileAboutHtml },
        }),
      });
      toast(res.ok ? "Settings saved" : "Failed to save", res.ok ? "success" : "error");
    } catch { toast("Network error", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-sm text-muted-foreground">loading...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-medium mb-6">settings</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="border border-border p-5">
          <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border">site</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">title</label>
              <input type="text" value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)}
                className="md-field" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">tagline</label>
              <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)}
                className="md-field" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">featured series slug (Start here)</label>
              <input type="text" value={featuredSeriesSlug} onChange={(e) => setFeaturedSeriesSlug(e.target.value)}
                className="md-field" placeholder="building-a-mini-search-engine" />
            </div>
          </div>
        </section>

        <section className="border border-border p-5">
          <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border">profile</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">name</label>
              <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)}
                className="md-field" />
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

        <section className="border border-border p-5">
          <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border">about page</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">headline</label>
              <input type="text" value={profileHeadline} onChange={(e) => setProfileHeadline(e.target.value)}
                className="md-field" placeholder="I reverse-engineer how search and AI decide what to rank." />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">body</label>
              <RichEditor content={profileAboutHtml} onChange={setProfileAboutHtml} outputFormat="html" />
            </div>
          </div>
        </section>

        <button type="submit" disabled={saving}
          className="md-btn md-btn-filled">
          {saving ? "saving..." : "save settings"}
        </button>
      </form>
    </div>
  );
}
