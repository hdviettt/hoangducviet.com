"use client";

import { useEffect, useState } from "react";
import RichEditor from "@/components/admin/RichEditor";
import MediaPicker from "@/components/admin/MediaPicker";
import { useToast } from "@/components/admin/Toast";
import PageHeader from "@/components/admin/PageHeader";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siteTitle, setSiteTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileDescription, setProfileDescription] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profileAboutHtml, setProfileAboutHtml] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.global) { setSiteTitle(data.global.title || ""); setTagline(data.global.tagline || ""); }
        if (data.profile) { setProfileName(data.profile.name || ""); setProfileDescription(data.profile.description || ""); setProfileImage(data.profile.image || ""); setProfileAboutHtml(data.profile.aboutHtml || ""); }
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
          profile: { name: profileName, description: profileDescription, image: profileImage, aboutHtml: profileAboutHtml },
        }),
      });
      toast(res.ok ? "Settings saved" : "Failed to save", res.ok ? "success" : "error");
    } catch { toast("Network error", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="md-body-medium text-md-on-surface-variant">loading...</div>;

  return (
    <div className="max-w-2xl">
      <PageHeader title="settings" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="rounded-xl border border-md-outline-variant p-5">
          <h2 className="md-label-small text-md-on-surface-variant uppercase tracking-wider mb-4 pb-2 border-b border-md-outline-variant">site</h2>
          <div className="space-y-3">
            <div>
              <label className="md-field-label">title</label>
              <input type="text" value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)}
                className="md-field" />
            </div>
            <div>
              <label className="md-field-label">tagline</label>
              <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)}
                className="md-field" />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-md-outline-variant p-5">
          <h2 className="md-label-small text-md-on-surface-variant uppercase tracking-wider mb-4 pb-2 border-b border-md-outline-variant">profile</h2>
          <div className="space-y-3">
            <div>
              <label className="md-field-label">name</label>
              <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)}
                className="md-field" />
            </div>
            <div>
              <label className="md-field-label">description</label>
              <RichEditor content={profileDescription} onChange={setProfileDescription} outputFormat="html" />
            </div>
            <div>
              <MediaPicker value={profileImage} onChange={setProfileImage} label="profile image" />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-md-outline-variant p-5">
          <h2 className="md-label-small text-md-on-surface-variant uppercase tracking-wider mb-4 pb-2 border-b border-md-outline-variant">about page</h2>
          <div className="space-y-3">
            <div>
              <label className="md-field-label">body</label>
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
