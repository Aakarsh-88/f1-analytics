"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ConstructorStandingsTable } from "@/components/standings/constructor-standings-table";
import type { ConstructorStandingRow } from "@/types/standings";

export function ConstructorStandingsSection({ rows }: { rows: ConstructorStandingRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.constructorName.toLowerCase().includes(q));
  }, [rows, query]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-secondary))]"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by team…"
          className="w-full rounded-md border border-line bg-[rgb(var(--surface-elevated))] py-2 pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-f1-red"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-[rgb(var(--text-secondary))]">
          No teams match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <ConstructorStandingsTable rows={filtered} />
      )}
    </div>
  );
}
