"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { DriverStandingsTable } from "@/components/standings/driver-standings-table";
import type { DriverStandingRow } from "@/types/standings";

export function DriverStandingsSection({ rows }: { rows: DriverStandingRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.driverName.toLowerCase().includes(q) ||
        r.driverCode.toLowerCase().includes(q) ||
        r.constructorName.toLowerCase().includes(q)
    );
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
          placeholder="Filter by driver or team…"
          className="w-full rounded-md border border-line bg-[rgb(var(--surface-elevated))] py-2 pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-f1-red"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-[rgb(var(--text-secondary))]">
          No drivers match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <DriverStandingsTable rows={filtered} />
      )}
    </div>
  );
}
