"use client";

import ExperienceEditor from "@/components/admin/ExperienceEditor";
import MediaPicker from "@/components/admin/MediaPicker";
import PageHeader from "@/components/admin/PageHeader";
import RichEditor from "@/components/admin/RichEditor";
import { useToast } from "@/components/admin/Toast";
import type { ExperienceCompany } from "@/db/schema";
import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [experience, setExperience] = useState<ExperienceCompany[]>([]);
  const [profileHeadline, setProfileHeadline] = useState("");
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
          setExperience(data.profile.experience || []);
          setProfileHeadline(data.profile.headline || "");
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
            experience,
            headline: profileHeadline,
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
    // 4xl, not 2xl. The simple sections keep the 2xl measure on
    // themselves, because a single-line input does not want to be 900px
    // wide. The Experience repeater does: it nests three levels, and at
    // 672px a result row had about 500px left for the text after the
    // card padding and the buttons.
    <div className="max-w-4xl">
      <PageHeader title="Settings" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="max-w-2xl rounded-xl border border-md-outline-variant p-5">
          <h2 className="text-[13px] leading-[18px] text-md-on-surface-variant mb-4 pb-2 border-b border-md-outline-variant">
            Site
          </h2>
          <div className="space-y-3">
            <div>
              {/* This is the site title, not the profile headline. The
                  htmlFor here read "profile-headline" — copied along with the
                  comment from the field two sections down — so clicking this
                  label scrolled away and focused the wrong input. */}
              <label className="md-field-label" htmlFor="site-title">
                Title
              </label>
              <input
                id="site-title"
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

        <section className="max-w-2xl rounded-xl border border-md-outline-variant p-5">
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
              {/* Associated, unlike its neighbours. The other five labels in
                  this form are bare and have been flagged for a while; this
                  one is new, so it may as well be right. */}
              <label className="md-field-label" htmlFor="profile-headline">
                Title
              </label>
              {/* The role line under the name, on the homepage and the About
                  page. A " / " splits it into two halves and the slash is set
                  quieter than the words, which is why the default reads
                  "Agentic AI Leader / Engineer" rather than being two fields.
                  Leave it empty to fall back to the built-in default. */}
              <input
                id="profile-headline"
                type="text"
                value={profileHeadline}
                onChange={(e) => setProfileHeadline(e.target.value)}
                placeholder="Agentic AI Leader / Engineer"
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

        <section className="max-w-2xl rounded-xl border border-md-outline-variant p-5">
          <h2 className="text-[13px] leading-[18px] text-md-on-surface-variant mb-4 pb-2 border-b border-md-outline-variant">
            About page
          </h2>
          <div className="space-y-3">
            <div>
              <label className="md-field-label">Body</label>
              {/* Markdown, khong phai HTML — giong het o soan noi dung bai
                  viet, nen moi thu dung duoc o bai viet cung dung duoc o day:
                  tieu de, danh sach, bang, khoi ```render```, va widget. */}
              <RichEditor
                content={profileAboutHtml}
                onChange={setProfileAboutHtml}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[13px] leading-[18px] text-md-on-surface-variant mb-4 pb-2 border-b border-md-outline-variant">
            Experience
          </h2>
          {/* Edited here, drawn wherever the Body puts
              ```widget:experience```. Keeping the two separate means the
              timeline can sit anywhere in the writing rather than being
              pinned to the bottom of the page.

              Durations are not entered: every "1 yr 4 mos" on the page is
              computed from the start and end months at render, so the page
              cannot drift out of date the way a typed duration would. */}
          <p className="mb-4 text-[13px] leading-[19px] text-md-on-surface-variant">
            Shown wherever the About body contains{" "}
            <code className="font-mono">```widget:experience```</code>. Roles
            newest first. Leave an end month blank for a role you are still in.
            Durations are calculated, not typed.
          </p>
          <ExperienceEditor value={experience} onChange={setExperience} />
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
