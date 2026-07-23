"use client";

import MediaPicker from "@/components/admin/MediaPicker";
import PageHeader from "@/components/admin/PageHeader";
import RichEditor from "@/components/admin/RichEditor";
import { useToast } from "@/components/admin/Toast";
import { useEffect, useState } from "react";

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
        if (data.global) {
          setSiteTitle(data.global.title || "");
          setTagline(data.global.tagline || "");
        }
        if (data.profile) {
          setProfileName(data.profile.name || "");
          setProfileDescription(data.profile.description || "");
          setProfileImage(data.profile.image || "");
          setProfileAboutHtml(data.profile.aboutHtml || "");
        }
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
          profile: {
            name: profileName,
            description: profileDescription,
            image: profileImage,
            aboutHtml: profileAboutHtml,
          },
        }),
      });
      toast(
        res.ok ? "Settings saved" : "Failed to save",
        res.ok ? "success" : "error",
      );
    } catch {
      toast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="text-[15px] leading-[22px] text-md-on-surface-variant">
        Loading…
      </div>
    );

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="rounded-xl border border-md-outline-variant p-5">
          <h2 className="text-[13px] leading-[18px] text-md-on-surface-variant mb-4 pb-2 border-b border-md-outline-variant">
            Site
          </h2>
          <div className="space-y-3">
            <div>
              <label className="md-field-label">Title</label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="md-field"
              />
            </div>
            <div>
              <label className="md-field-label">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="md-field"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-md-outline-variant p-5">
          <h2 className="text-[13px] leading-[18px] text-md-on-surface-variant mb-4 pb-2 border-b border-md-outline-variant">
            Profile
          </h2>
          <div className="space-y-3">
            <div>
              <label className="md-field-label">Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="md-field"
              />
            </div>
            <div>
              <label className="md-field-label">Description</label>
              <RichEditor
                content={profileDescription}
                onChange={setProfileDescription}
                outputFormat="html"
              />
            </div>
            <div>
              <MediaPicker
                value={profileImage}
                onChange={setProfileImage}
                label="Profile image"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-md-outline-variant p-5">
          <h2 className="text-[13px] leading-[18px] text-md-on-surface-variant mb-4 pb-2 border-b border-md-outline-variant">
            About page
          </h2>
          <div className="space-y-3">
            <div>
              <label className="md-field-label">Body</label>
              <RichEditor
                content={profileAboutHtml}
                onChange={setProfileAboutHtml}
                outputFormat="html"
              />
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="md-btn md-btn-filled"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
      </form>
    </div>
  );
}
