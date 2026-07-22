"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { DriverCard } from "@/components/drivers/driver-card";
import type { DriverSummary } from "@/types/driver";

export function DriversGrid({ drivers }: { drivers: DriverSummary[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return drivers;
    return drivers.filter(
      (d) =>
        d.fullName.toLowerCase().includes(q) ||
        d.nationality?.toLowerCase().includes(q) ||
        d.code?.toLowerCase().includes(q)
    );
  }, [drivers, query]);

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
          placeholder="Filter by name, nationality, code…"
          className="w-full rounded-md border border-line bg-[rgb(var(--surface-elevated))] py-2 pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-f1-red"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-[rgb(var(--text-secondary))]">
          No drivers match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((driver) => (
            <DriverCard key={driver.driverId} driver={driver} />
          ))}
        </div>
      )}
    </div>
  );
}
