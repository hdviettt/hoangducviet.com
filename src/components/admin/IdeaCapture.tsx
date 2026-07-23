"use client";

import { useToast } from "@/components/admin/Toast";
import { Icon } from "@/components/ui/Icon";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Quick idea capture on the dashboard: type a thought, hit Enter, and it's saved
// as a draft post you can flesh out later. Stays put (keeps focus) so you can
// brain-dump several ideas in a row; the drafts backlog below refreshes.
export default function IdeaCapture() {
  const router = useRouter();
  const { toast } = useToast();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const slugify = (t: string) =>
    t
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const capture = async () => {
    const title = value.trim();
    if (!title || saving) return;
    setSaving(true);
    // Auto-suffix keeps the slug unique for rapid capture; refine it in the
    // editor before publishing.
    const slug = `${slugify(title) || "idea"}-${Date.now().toString(36).slice(-4)}`;
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, status: "draft", content: "" }),
      });
      if (res.ok) {
        setValue("");
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1500);
        router.refresh();
      } else {
        toast("Couldn't save the idea", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-md-outline-variant bg-transparent pl-3.5 pr-2 py-2 focus-within:border-md-primary transition-colors">
      <Icon
        name="lightbulb"
        size={20}
        className="shrink-0 text-md-on-surface-variant"
      />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            capture();
          }
        }}
        placeholder="Capture an idea — Enter to save it as a draft"
        className="flex-1 min-w-0 bg-transparent text-[17px] leading-6 focus:outline-none placeholder:text-md-on-surface-variant/60"
      />
      <button
        type="button"
        onClick={capture}
        disabled={!value.trim() || saving}
        className="md-btn md-btn-filled md-btn-sm shrink-0 disabled:opacity-40"
      >
        {saving ? "…" : justAdded ? "Added ✓" : "Capture"}
      </button>
    </div>
  );
}
