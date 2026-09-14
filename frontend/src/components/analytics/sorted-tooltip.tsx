"use client";

import type { TooltipContentProps } from "recharts";

type TooltipEntry = {
  name?: unknown;
  value?: unknown;
  color?: string;
  payload?: Record<string, unknown>;
};

interface SortedTooltipProps extends Partial<TooltipContentProps> {
  sortDescending?: boolean;
  formatValue?: (value: unknown, name: unknown) => string | number;
  formatName?: (entry: TooltipEntry) => string;
}

export function SortedTooltip({
  active,
  payload,
  label,
  sortDescending = true,
  formatValue,
  formatName,
}: SortedTooltipProps) {
  if (!active || !payload?.length) return null;

  const entries: TooltipEntry[] = [...payload].sort((a, b) =>
    sortDescending ? Number(b.value) - Number(a.value) : 0
  );

  return (
    <div
      className="rounded-md border border-line bg-[rgb(var(--surface-elevated))] p-2 font-mono text-xs text-[rgb(var(--text-primary))]"
      style={{ color: "rgb(var(--text-primary))" }}
    >
      <p className="mb-1 font-semibold">{label}</p>
      {entries.map((entry, index) => (
        <p key={`${String(entry.name)}-${index}`} className="flex items-center gap-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
          {formatName ? formatName(entry) : String(entry.name)}:{" "}
          {formatValue ? formatValue(entry.value, entry.name) : String(entry.value ?? "")}
        </p>
      ))}
    </div>
  );
}
