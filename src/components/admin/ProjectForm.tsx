"use client";

import DescriptionMeter from "@/components/admin/DescriptionMeter";
import MediaPicker from "@/components/admin/MediaPicker";
import RichEditor from "@/components/admin/RichEditor";
import { useToast } from "@/components/admin/Toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProjectGroup {
  slug: string;
  title: string;
}

interface ProjectFormProps {
  initialData?: {
    slug: string;
    title: string;
    url: string;
    summary: string;
    description: string;
    thumbnail: string;
    status: string;
    groupSlug: string;
    postSlugs: string[];
  };
  allPosts: Array<{ slug: string; title: string }>;
  allGroups: ProjectGroup[];
  isEdit?: boolean;
}

export default function ProjectForm({
  initialData,
  allPosts,
  allGroups: initialGroups,
  isEdit,
}: ProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [url, setUrl] = useState(initialData?.url ?? "");
  const [summary, setSummary] = useState(initialData?.summary ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "draft");
  const [groupSlug, setGroupSlug] = useState(initialData?.groupSlug ?? "");
  const [postSlugs, setPostSlugs] = useState<string[]>(
    initialData?.postSlugs ?? [],
  );
  const [groups, setGroups] = useState<ProjectGroup[]>(initialGroups);
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEdit) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      );
    }
  };

  const togglePost = (postSlug: string) => {
    setPostSlugs((prev) =>
      prev.includes(postSlug)
        ? prev.filter((s) => s !== postSlug)
        : [...prev, postSlug],
    );
  };

  const handleCreateGroup = async () => {
    if (!newGroupTitle.trim()) return;
    setCreatingGroup(true);
    try {
      const res = await fetch("/api/project-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newGroupTitle.trim() }),
      });
      if (!res.ok) {
        toast("Failed to create group", "error");
        return;
      }
      const created = await res.json();
      setGroups((prev) => [...prev, created]);
      setGroupSlug(created.slug);
      setNewGroupTitle("");
    } catch {
      toast("Network error", "error");
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url_ = isEdit
        ? `/api/projects/${initialData?.slug}`
        : "/api/projects";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url_, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          url: url || null,
          summary: summary || null,
          description,
          thumbnail,
          status,
          groupSlug: groupSlug || null,
          postSlugs,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "Failed to save", "error");
        return;
      }

      router.push("/admin/projects");
      router.refresh();
    } catch {
      toast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="md-field-label">title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="md-field"
            required
          />
        </div>
        <div>
          <label className="md-field-label">slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="md-field"
            required
          />
        </div>
      </div>

      <div>
        <label className="md-field-label">project url</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="md-field"
        />
      </div>

      <div>
        <label className="md-field-label">
          summary <span>(shown on cards)</span>
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={5}
          placeholder="Shown in full on the collection card — aim for ≤160 characters"
          className="md-field !leading-6"
        />
        <DescriptionMeter value={summary} />
      </div>

      <div>
        <label className="md-field-label">
          content <span>(shown on project page)</span>
        </label>
        <RichEditor
          content={description}
          onChange={setDescription}
          outputFormat="html"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <MediaPicker
            value={thumbnail}
            onChange={setThumbnail}
            label="Thumbnail"
          />
        </div>
        <div>
          <label className="md-field-label">status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="md-field"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div>
        <label className="md-field-label">group</label>
        <div className="flex gap-2">
          <select
            value={groupSlug}
            onChange={(e) => setGroupSlug(e.target.value)}
            className="md-field flex-1"
          >
            <option value="">No group</option>
            {groups.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newGroupTitle}
            onChange={(e) => setNewGroupTitle(e.target.value)}
            placeholder="New group name..."
            className="md-field-dense flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateGroup();
              }
            }}
          />
          <button
            type="button"
            onClick={handleCreateGroup}
            disabled={creatingGroup || !newGroupTitle.trim()}
            className="md-btn md-btn-tonal shrink-0"
          >
            {creatingGroup ? "..." : "+ add"}
          </button>
        </div>
      </div>

      {allPosts.length > 0 && (
        <div>
          <label className="md-field-label">related posts</label>
          <div className="rounded-2xl border border-md-outline-variant max-h-48 overflow-y-auto divide-y divide-md-outline-variant">
            {allPosts.map((post) => (
              <button
                key={post.slug}
                type="button"
                onClick={() => togglePost(post.slug)}
                className={`w-full text-left px-3 py-2 text-[15px] leading-[22px] transition-colors ${
                  postSlugs.includes(post.slug)
                    ? "text-md-primary bg-md-primary/10"
                    : "text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-container"
                }`}
              >
                {post.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="md-btn md-btn-filled"
        >
          {saving ? "saving..." : isEdit ? "Update series" : "Create series"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="md-btn md-btn-outlined"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
