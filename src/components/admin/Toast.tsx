"use client";

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
            className={`relative overflow-hidden px-4 py-2.5 text-sm border animate-in slide-in-from-right fade-in-0 duration-200 ${
              t.type === "error"
                ? "bg-destructive/10 border-destructive text-destructive"
                : "bg-primary/10 border-primary text-primary"
            }`}
          >
            <div className="flex items-center gap-2">
              {t.type === "success" && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    strokeDasharray="24"
                    className="animate-[checkDraw_0.3s_0.2s_ease-out_forwards]"
                    style={{ strokeDashoffset: 24 }}
                  />
                </svg>
              )}
              <span>{t.message}</span>
            </div>
            <div
              className={`absolute bottom-0 left-0 right-0 h-0.5 toast-progress ${
                t.type === "error" ? "bg-destructive/40" : "bg-primary/40"
              }`}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
