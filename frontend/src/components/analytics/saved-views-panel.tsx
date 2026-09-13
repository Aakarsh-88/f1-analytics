"use client";

import { Bookmark, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useSavedViews } from "@/hooks/use-saved-views";
import { SignedIn, SignedOut, useAuthUser } from "@/lib/auth";

interface SavedViewsPanelProps {
  namespace?: string;
  title?: string;
  fromYear: number;
  toYear: number;
  selectedIds?: string[];
  onLoadView: (fromYear: number, toYear: number, selectedIds?: string[]) => void;
}

/**
 * The auth-gated feature for this milestone: saving a named season-range
 * preset is only available to signed-in users. Split into two small
 * components below `SavedViewsPanel` itself specifically so
 * `useSavedViews`/`useAuthUser` are only ever called while actually
 * signed in — calling hooks inside a conditionally-rendered branch
 * would violate the Rules of Hooks, so the branching happens at the
 * component level (via `<SignedIn>`/`<SignedOut>`), not inside one
 * component's render body.
 */
export function SavedViewsPanel(props: SavedViewsPanelProps) {
  return (
    <div className="rounded-lg border border-line bg-[rgb(var(--surface-card))] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Bookmark size={16} className="text-[rgb(var(--text-secondary))]" />
        <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-secondary))]">
          {props.title ?? "Saved Views"}
        </h3>
      </div>

      <SignedIn>
        <SavedViewsAuthenticated {...props} />
      </SignedIn>
      <SignedOut>
        <p className="text-sm text-[rgb(var(--text-secondary))]">
          Sign in to save named season-range presets you can jump back to later.
        </p>
      </SignedOut>
    </div>
  );
}

function SavedViewsAuthenticated({ namespace = "default", fromYear, toYear, selectedIds, onLoadView }: SavedViewsPanelProps) {
  const { user } = useAuthUser();
  const { views, mounted, saveView, deleteView } = useSavedViews(user?.id ?? null, namespace);
  const [name, setName] = useState("");

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    saveView(trimmed, fromYear, toYear, selectedIds);
    setName("");
  }

  // Avoids a flash of "no saved views" before localStorage has been read
  // client-side — mirrors the mount-guard pattern used by ThemeToggle.
  if (!mounted) {
    return <p className="text-sm text-[rgb(var(--text-secondary))]">Loading saved views…</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder={`e.g. "${fromYear}–${toYear} rivalry"`}
          className="min-w-0 flex-1 rounded-md border border-line bg-[rgb(var(--surface-elevated))] px-2.5 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-f1-red"
        />
        <Button size="sm" variant="secondary" onClick={handleSave} disabled={!name.trim()}>
          Save {fromYear}–{toYear}
        </Button>
      </div>

      {views.length === 0 ? (
        <p className="text-sm text-[rgb(var(--text-secondary))]">
          No saved views yet — pick a season range above and save it.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {views.map((view) => (
            <li
              key={view.id}
              className="flex items-center justify-between rounded-md bg-[rgb(var(--surface-elevated))] px-3 py-2 text-sm"
            >
              <button
                type="button"
                onClick={() => {
                  if (view.selectedIds) onLoadView(view.fromYear, view.toYear, view.selectedIds);
                  else onLoadView(view.fromYear, view.toYear);
                }}
                className="text-left font-medium hover:text-f1-red"
              >
                {view.name}
                <span className="ml-2 font-mono text-xs text-[rgb(var(--text-secondary))]">
                  {view.fromYear}–{view.toYear}
                </span>
              </button>
              <button
                type="button"
                aria-label={`Delete saved view "${view.name}"`}
                onClick={() => deleteView(view.id)}
                className="rounded p-1 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--surface-card))] hover:text-f1-red"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
