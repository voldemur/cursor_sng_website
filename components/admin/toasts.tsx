"use client";

import { useEffect } from "react";

export type ToastItem = { id: string; kind: "ok" | "err"; message: string };

export function Toasts({
  items,
  onDismiss,
}: {
  items: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timers = items.map((item) => window.setTimeout(() => onDismiss(item.id), 4500));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [items, onDismiss]);

  if (!items.length) return null;

  return (
    <div className="fixed right-4 bottom-4 z-[80] flex w-[min(100%-2rem,24rem)] flex-col gap-2" role="status">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`rounded-xl border px-4 py-3 text-left text-sm ${
            item.kind === "ok"
              ? "border-emerald-400/30 bg-[#102018] text-emerald-100"
              : "border-red-400/30 bg-[#2a1214] text-red-100"
          }`}
          onClick={() => onDismiss(item.id)}
        >
          {item.message}
        </button>
      ))}
    </div>
  );
}
