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
        if (data.global) {
          setSiteTitle(data.global.title || "");
          setTagline(data.global.tagline || "");
        }
        if (data.profile) {
          setProfileName(data.profile.name || "");
          setProfileDescription(data.profile.description || "");
          setProfileImage(data.profile.image || "");
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
          },
        }),
      });

      if (res.ok) {
        alert("Settings saved");
      } else {
        alert("Failed to save");
      }
    } catch {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-xl font-medium mb-6">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        {/* Global Settings */}
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wider mb-4 pb-2 border-b border-border">
            Site Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                Site Title
              </label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </section>

        {/* Profile Settings */}
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wider mb-4 pb-2 border-b border-border">
            Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                Description (HTML)
              </label>
              <textarea
                value={profileDescription}
                onChange={(e) => setProfileDescription(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary min-h-[150px] resize-y"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                Profile Image URL
              </label>
              <input
                type="text"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="/uploads/profile.jpg"
              />
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-primary-foreground px-6 py-2 text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
