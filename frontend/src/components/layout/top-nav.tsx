"use client";

import { Search } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";

export function TopNav() {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-line bg-[rgb(var(--surface-card))] px-6">
      <div className="relative w-full max-w-sm">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-secondary))]"
        />
        <input
          type="search"
          placeholder="Search drivers, teams, races…"
          className="w-full rounded-md border border-line bg-[rgb(var(--surface-elevated))] py-2 pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-secondary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-f1-red"
        />
      </div>

      <div className="flex items-center gap-4">
        <select
          aria-label="Season"
          defaultValue="2026"
          className="rounded-md border border-line bg-[rgb(var(--surface-elevated))] px-3 py-2 text-sm font-medium text-[rgb(var(--text-primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-f1-red"
        >
          {Array.from({ length: 10 }, (_, i) => 2026 - i).map((year) => (
            <option key={year} value={year}>
              {year} Season
            </option>
          ))}
        </select>
        <ThemeToggle />
      </div>
    </header>
  );
}
