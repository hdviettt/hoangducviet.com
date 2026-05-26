"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "confirm",
  cancelLabel = "cancel",
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-in fade-in-0 duration-150">
      <div className="bg-md-surface-container-high rounded-[28px] shadow-md-3 p-6 w-full max-w-sm animate-in fade-in-0 zoom-in-95 duration-150">
        {title && <h3 className="md-headline-small mb-3">{title}</h3>}
        <p className="md-body-medium text-md-on-surface-variant mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="md-btn md-btn-text"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`md-btn ${destructive ? "md-btn-filled" : "md-btn-filled"}`}
            style={destructive ? { background: "hsl(var(--md-sys-color-error))", color: "hsl(var(--md-sys-color-on-error))" } : undefined}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
