"use client";

import ConfirmModal from "@/components/admin/ConfirmModal";
import { Icon } from "@/components/ui/Icon";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteButtonProps {
  slug: string;
  name: string;
  apiPath: "posts" | "projects" | "work";
  /** Icon only, for dense rows where a word would outweigh the row. */
  compact?: boolean;
}

export default function DeleteButton({
  slug,
  name,
  apiPath,
  compact = false,
}: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setOpen(false);
    await fetch(`/api/${apiPath}/${slug}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={compact ? `Delete "${name}"` : undefined}
        aria-label={compact ? `Delete "${name}"` : undefined}
        className={
          compact
            ? "p-1 rounded text-md-on-surface-variant hover:text-md-error hover:bg-md-on-surface/8 transition-colors duration-fast"
            : "text-[13px] leading-[18px] text-md-on-surface-variant hover:text-md-error transition-colors"
        }
      >
        {compact ? <Icon name="delete" size={15} /> : "delete"}
      </button>
      <ConfirmModal
        open={open}
        message={`Delete "${name}"? This cannot be undone.`}
        confirmLabel="delete"
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
