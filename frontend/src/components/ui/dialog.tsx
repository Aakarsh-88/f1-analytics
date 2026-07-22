"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * A deliberately minimal modal — no portal, no focus trap library. Fine
 * for this app's use cases (e.g. a "compare drivers" panel), which are
 * triggered from a single, predictable location rather than deeply
 * nested UI. If a future need calls for full a11y-audited modal
 * behavior (nested dialogs, complex focus trapping), reach for a
 * library like Radix instead of extending this.
 */
export function Dialog({ open, onClose, title, children }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="relative w-full max-w-lg rounded-lg border border-line bg-[rgb(var(--surface-card))] shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="dialog-title" className="font-display text-lg font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1.5 text-[rgb(var(--text-secondary))] transition-colors hover:bg-[rgb(var(--surface-elevated))]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
