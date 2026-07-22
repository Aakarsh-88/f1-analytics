import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Optional trend, e.g. "+3 vs last season" — rendered in DRS green if positive, muted otherwise. */
  trend?: string;
  trendPositive?: boolean;
}

export function StatCard({ label, value, icon: Icon, trend, trendPositive }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-secondary))]">
            {label}
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-[rgb(var(--text-primary))]">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                trendPositive ? "text-sector-green" : "text-[rgb(var(--text-secondary))]"
              )}
            >
              {trend}
            </p>
          )}
        </div>
        <div className="rounded-md bg-[rgb(var(--surface-elevated))] p-2.5 text-f1-red">
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
    </Card>
  );
}
