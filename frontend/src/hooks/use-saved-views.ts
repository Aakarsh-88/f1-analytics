"use client";

import { useEffect, useState } from "react";

export interface SavedView {
  id: string;
  name: string;
  fromYear: number;
  toYear: number;
  selectedIds?: string[];
  createdAt: string;
}

function storageKeyFor(userId: string, namespace: string): string {
  // Namespaced per Clerk user ID so saved views never leak across
  // accounts on a shared browser/machine.
  return namespace === "default"
    ? `f1-analytics:saved-views:${userId}`
    : `f1-analytics:saved-views:${namespace}:${userId}`;
}

/**
 * Manages a signed-in user's saved season-range presets for the
 * Analytics page. Deliberately client-only (localStorage) rather than a
 * backend call — there's no `saved_views` table or endpoint yet, and
 * this keeps the feature honestly scoped to what actually exists today.
 * Swapping this for a real per-user backend store later only requires
 * rewriting the internals of this hook; every component using it reads
 * the same `{ views, saveView, deleteView }` shape either way.
 *
 * `userId` should come from `useAuthUser()`. Pass `null` when signed
 * out — the hook simply returns an empty, read-only view list rather
 * than throwing, so callers don't need to guard every call site.
 */
export function useSavedViews(userId: string | null, namespace = "default") {
  const [mounted, setMounted] = useState(false);
  const [views, setViews] = useState<SavedView[]>([]);

  // Avoids a hydration mismatch: localStorage doesn't exist on the
  // server, so we only read it after mount, same pattern as ThemeToggle.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !userId) {
      setViews([]);
      return;
    }
    try {
      const raw = window.localStorage.getItem(storageKeyFor(userId, namespace));
      setViews(raw ? (JSON.parse(raw) as SavedView[]) : []);
    } catch {
      setViews([]);
    }
  }, [mounted, userId, namespace]);

  function persist(next: SavedView[]) {
    setViews(next);
    if (!userId) return;
    try {
      window.localStorage.setItem(storageKeyFor(userId, namespace), JSON.stringify(next));
    } catch {
      // Storage can fail (quota, private browsing) — the in-memory
      // state above still updates for this session, so the UI stays
      // responsive even if persistence silently fails.
    }
  }

  function saveView(name: string, fromYear: number, toYear: number, selectedIds?: string[]) {
    if (!userId) return;
    const newView: SavedView = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
      name,
      fromYear,
      toYear,
      ...(selectedIds ? { selectedIds } : {}),
      createdAt: new Date().toISOString(),
    };
    persist([newView, ...views]);
  }

  function deleteView(id: string) {
    persist(views.filter((v) => v.id !== id));
  }

  return { views, mounted, saveView, deleteView };
}
