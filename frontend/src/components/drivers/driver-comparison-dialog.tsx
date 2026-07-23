"use client";

import { Dialog } from "@/components/ui/dialog";
import type { DriverSummary } from "@/types/driver";

interface DriverComparisonDialogProps {
  open: boolean;
  onClose: () => void;
  drivers: [DriverSummary, DriverSummary];
}

const ROWS: { label: string; get: (d: DriverSummary) => string | number }[] = [
  { label: "Nationality", get: (d) => d.nationality ?? "—" },
  { label: "Car Number", get: (d) => d.number ?? "—" },
  { label: "Wins", get: (d) => d.wins },
  { label: "Podiums", get: (d) => d.podiums },
  { label: "Championships", get: (d) => d.championships },
  { label: "Win Rate", get: (d) => `${d.winPercentage.toFixed(1)}%` },
];

/**
 * Highlights whichever driver has the better value in a row (higher is
 * better for every metric here) in DRS green — a quick visual "who's
 * ahead" read rather than making the reader compare raw numbers.
 */
function isBetter(a: string | number, b: string | number): boolean {
  const numA = typeof a === "number" ? a : parseFloat(a as string);
  const numB = typeof b === "number" ? b : parseFloat(b as string);
  if (Number.isNaN(numA) || Number.isNaN(numB)) return false;
  return numA > numB;
}

export function DriverComparisonDialog({ open, onClose, drivers }: DriverComparisonDialogProps) {
  const [a, b] = drivers;

  return (
    <Dialog open={open} onClose={onClose} title="Driver Comparison">
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="font-display font-semibold">{a.fullName}</div>
        <div className="text-center font-mono text-xs text-[rgb(var(--text-secondary))]">vs</div>
        <div className="text-right font-display font-semibold">{b.fullName}</div>

        {ROWS.map((row) => {
          const valueA = row.get(a);
          const valueB = row.get(b);
          const aWins = isBetter(valueA, valueB);
          const bWins = isBetter(valueB, valueA);
          return (
            <div key={row.label} className="contents">
              <div className={`py-2 font-mono tabular-nums ${aWins ? "font-bold text-sector-green" : ""}`}>
                {valueA}
              </div>
              <div className="py-2 text-center text-xs uppercase tracking-wider text-[rgb(var(--text-secondary))]">
                {row.label}
              </div>
              <div
                className={`py-2 text-right font-mono tabular-nums ${bWins ? "font-bold text-sector-green" : ""}`}
              >
                {valueB}
              </div>
            </div>
          );
        })}
      </div>
    </Dialog>
  );
}
