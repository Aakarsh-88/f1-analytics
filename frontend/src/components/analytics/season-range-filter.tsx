"use client";

import type { SeasonRange } from "@/types/analytics";

interface SeasonRangeFilterProps {
  range: SeasonRange;
  fromYear: number;
  toYear: number;
  onChange: (fromYear: number, toYear: number) => void;
  labelPrefix?: string;
}

export function SeasonRangeFilter({ range, fromYear, toYear, onChange, labelPrefix = "" }: SeasonRangeFilterProps) {
  const years = Array.from(
    { length: range.max - range.min + 1 },
    (_, i) => range.min + i
  );

  return (
    <div className="flex items-center gap-3 text-sm">
      <label className="flex items-center gap-2 text-[rgb(var(--text-secondary))]">
        From
        <select
          value={fromYear}
          aria-label={`${labelPrefix}From`}
          onChange={(e) => {
            const next = Number(e.target.value);
            onChange(Math.min(next, toYear), toYear);
          }}
          className="rounded-md border border-line bg-[rgb(var(--surface-elevated))] px-2 py-1.5 font-mono text-[rgb(var(--text-primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-f1-red"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-[rgb(var(--text-secondary))]">
        To
        <select
          value={toYear}
          aria-label={`${labelPrefix}To`}
          onChange={(e) => {
            const next = Number(e.target.value);
            onChange(fromYear, Math.max(next, fromYear));
          }}
          className="rounded-md border border-line bg-[rgb(var(--surface-elevated))] px-2 py-1.5 font-mono text-[rgb(var(--text-primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-f1-red"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
