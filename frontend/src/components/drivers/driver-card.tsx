import Link from "next/link";

import { Card } from "@/components/ui/card";
import type { DriverSummary } from "@/types/driver";

export function DriverCard({ driver }: { driver: DriverSummary }) {
  return (
    <Link href={`/drivers/${driver.driverRef}`}>
      <Card className="h-full cursor-pointer hover:border-f1-red/50">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-lg font-bold">{driver.fullName}</p>
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              {driver.nationality ?? "Unknown"}
              {driver.number !== null && ` · #${driver.number}`}
            </p>
          </div>
          {driver.code && (
            <span className="rounded-md bg-[rgb(var(--surface-elevated))] px-2 py-1 font-mono text-xs font-bold tracking-wider">
              {driver.code}
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="Wins" value={driver.wins} />
          <Stat label="Podiums" value={driver.podiums} />
          <Stat label="Titles" value={driver.championships} />
        </div>

        <div className="mt-3 border-t border-line pt-3 text-xs text-[rgb(var(--text-secondary))]">
          Win rate:{" "}
          <span className="font-mono font-semibold text-[rgb(var(--text-primary))]">
            {driver.winPercentage.toFixed(1)}%
          </span>
        </div>
      </Card>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-mono text-xl font-semibold tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-[rgb(var(--text-secondary))]">
        {label}
      </p>
    </div>
  );
}
