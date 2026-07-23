"use client";

import ConfirmModal from "@/components/admin/ConfirmModal";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteButtonProps {
  slug: string;
  name: string;
  apiPath: "posts" | "projects" | "work";
}

export default function DeleteButton({
  slug,
  name,
  apiPath,
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
        className="md-label-medium text-md-on-surface-variant hover:text-md-error transition-colors"
      >
        delete
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
