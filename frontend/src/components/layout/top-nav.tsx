"use client";


import {
  UserButton,
  SignedIn,
  SignedOut,
  SignInButton,
} from "@clerk/nextjs";

import { Building2, Flag, Search, Trophy, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";
import type { SearchItem, SearchItemType } from "@/types/search";

const TYPE_ICON: Record<SearchItemType, typeof Users> = {
  driver: Users,
  constructor: Building2,
  race: Flag,
  page: Trophy,
};

const TYPE_LABEL: Record<SearchItemType, string> = {
  driver: "Driver",
  constructor: "Constructor",
  race: "Race",
  page: "Standings",
};

const MAX_RESULTS = 8;

export function TopNav({
  searchIndex,
  seasonRange,
}: {
  searchIndex: SearchItem[];
  seasonRange?: { min: number; max: number };
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchIndex
      .filter(
        (item) =>
          item.label.toLowerCase().includes(q) || item.sublabel?.toLowerCase().includes(q)
      )
      .slice(0, MAX_RESULTS);
  }, [query, searchIndex]);

  // Close the dropdown on outside click — a real cross-page search needs
  // this since, unlike a per-page filter, its results float over content.
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function goTo(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-line bg-[rgb(var(--surface-card))] px-6">
      <div ref={containerRef} className="relative w-full max-w-sm">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-secondary))]"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search drivers, teams, races…"
          className="w-full rounded-md border border-line bg-[rgb(var(--surface-elevated))] py-2 pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-secondary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-f1-red"
        />

        {open && query.trim() && (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-96 overflow-y-auto rounded-lg border border-line bg-[rgb(var(--surface-card))] shadow-xl">
            {results.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-[rgb(var(--text-secondary))]">
                No results for &ldquo;{query}&rdquo;.
              </p>
            ) : (
              <ul>
                {results.map((item) => {
                  const Icon = TYPE_ICON[item.type];
                  return (
                    <li key={`${item.type}-${item.href}-${item.label}`}>
                      <button
                        type="button"
                        onClick={() => goTo(item.href)}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                          "hover:bg-[rgb(var(--surface-elevated))]"
                        )}
                      >
                        <Icon size={16} className="shrink-0 text-[rgb(var(--text-secondary))]" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{item.label}</span>
                          {item.sublabel && (
                            <span className="block truncate text-xs text-[rgb(var(--text-secondary))]">
                              {item.sublabel}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 rounded bg-[rgb(var(--surface-elevated))] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[rgb(var(--text-secondary))]">
                          {TYPE_LABEL[item.type]}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
  {seasonRange && (
    <select
      aria-label="Season"
      defaultValue={String(seasonRange.max)}
      className="rounded-md border border-line bg-[rgb(var(--surface-elevated))] px-3 py-2 text-sm font-medium text-[rgb(var(--text-primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-f1-red"
    >
      {Array.from(
        { length: Math.min(10, seasonRange.max - seasonRange.min + 1) },
        (_, i) => seasonRange.max - i
      ).map((year) => (
        <option key={year} value={year}>
          {year} Season
        </option>
      ))}
    </select>
  )}

  <ThemeToggle />

  <SignedOut>
    <SignInButton mode="modal">
      <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
        Sign In
      </button>
    </SignInButton>
  </SignedOut>

  <SignedIn>
    <UserButton afterSignOutUrl="/" />
  </SignedIn>
</div>
    </header>
  );
}
