"use client";

import { GitCompare, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DriverCard } from "@/components/drivers/driver-card";
import { DriverComparisonDialog } from "@/components/drivers/driver-comparison-dialog";
import type { DriverSummary } from "@/types/driver";

const MAX_COMPARE = 2;

export function DriversGrid({ drivers }: { drivers: DriverSummary[] }) {
  const [query, setQuery] = useState("");
  const [selectedRefs, setSelectedRefs] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  function toggleSelect(driver: DriverSummary) {
    setSelectedRefs((prev) => {
      if (prev.includes(driver.driverRef)) {
        return prev.filter((ref) => ref !== driver.driverRef);
      }
      // Once 2 are selected, picking a 3rd bumps the oldest selection out —
      // keeps exactly the last MAX_COMPARE choices instead of blocking the click.
      const next = [...prev, driver.driverRef];
      return next.length > MAX_COMPARE ? next.slice(next.length - MAX_COMPARE) : next;
    });
  }

  const selectedDrivers = selectedRefs
    .map((ref) => drivers.find((d) => d.driverRef === ref))
    .filter((d): d is DriverSummary => Boolean(d));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
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

        {selectedDrivers.length > 0 && (
          <div className="flex items-center gap-2 rounded-md border border-line bg-[rgb(var(--surface-elevated))] py-1.5 pl-3 pr-1.5">
            <GitCompare size={14} className="text-[rgb(var(--text-secondary))]" />
            <span className="text-xs text-[rgb(var(--text-secondary))]">
              {selectedDrivers.length}/{MAX_COMPARE} selected
            </span>
            <Button
              size="sm"
              variant="primary"
              disabled={selectedDrivers.length !== MAX_COMPARE}
              onClick={() => setDialogOpen(true)}
            >
              Compare
            </Button>
            <button
              type="button"
              aria-label="Clear selection"
              onClick={() => setSelectedRefs([])}
              className="rounded-md p-1.5 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--surface-card))]"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-[rgb(var(--text-secondary))]">
          No drivers match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((driver) => (
            <DriverCard
              key={driver.driverId}
              driver={driver}
              selectable
              selected={selectedRefs.includes(driver.driverRef)}
              onToggleSelect={toggleSelect}
            />
          ))}
        </div>
      )}

      {selectedDrivers.length === MAX_COMPARE && (
        <DriverComparisonDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          drivers={[selectedDrivers[0]!, selectedDrivers[1]!]}
        />
      )}
    </div>
  );
}
