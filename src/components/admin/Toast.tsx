"use client";

import { Icon } from "@/components/ui/Icon";
import { createContext, useCallback, useContext, useState } from "react";

type ToastType = "success" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="relative overflow-hidden flex items-center gap-2.5 pl-3.5 pr-5 py-3 rounded-xl shadow-md-3 bg-md-surface-container-high text-md-on-surface text-[15px] leading-[22px] animate-in slide-in-from-right fade-in-0 duration-200"
          >
            {t.type === "success" ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-md-primary"
              >
                <path
                  d="M5 13l4 4L19 7"
                  strokeDasharray="24"
                  className="animate-[checkDraw_0.3s_0.2s_ease-out_forwards]"
                  style={{ strokeDashoffset: 24 }}
                />
              </svg>
            ) : (
              <Icon name="error" size={18} className="shrink-0 text-md-error" />
            )}
            <span>{t.message}</span>
            <div
              className={`absolute bottom-0 left-0 right-0 h-0.5 toast-progress ${
                t.type === "error" ? "bg-md-error/50" : "bg-md-primary/50"
              }`}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
