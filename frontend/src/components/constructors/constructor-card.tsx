import { Card } from "@/components/ui/card";
import { TrendSparkline } from "@/components/constructors/trend-sparkline";
import { getTeamBorderClass, getTeamTextClass } from "@/lib/team-colors";
import { cn } from "@/lib/utils";
import type { ConstructorSummary } from "@/types/constructor";

export function ConstructorCard({ constructor: c }: { constructor: ConstructorSummary }) {
  return (
    <Card className={cn("border-t-4", getTeamBorderClass(c.constructorRef))} showStrip={false}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-lg font-bold">{c.name}</p>
          <p className={cn("text-sm font-medium", getTeamTextClass(c.constructorRef))}>
            {c.nationality ?? "Unknown"} · Est. {c.firstSeason}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Wins" value={c.wins} />
        <Stat label="Podiums" value={c.podiums} />
        <Stat label="Titles" value={c.championships} />
      </div>

      <div className="mt-4 border-t border-line pt-3">
        <p className="mb-1 text-[10px] uppercase tracking-wider text-[rgb(var(--text-secondary))]">
          Recent form
        </p>
        <TrendSparkline data={c.recentTrend} />
      </div>
    </Card>
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
