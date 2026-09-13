"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getDistinctDriverColors } from "@/lib/analytics-driver-colors";
import type { DriverTeamPoint, PoleLeaderboardRow } from "@/types/analytics";
import { Cell } from "recharts";

function PoleTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value?: number; payload?: PoleLeaderboardRow }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line bg-[rgb(var(--surface-elevated))] p-2 font-mono text-xs text-[rgb(var(--text-primary))]">
      {payload.map((item) => (
        <p key={item.payload?.driverCode}>
          {item.payload?.driverCode}: {item.value}
        </p>
      ))}
    </div>
  );
}

export function PolePositionsChart({
  rows,
  driverTeams,
}: {
  rows: PoleLeaderboardRow[];
  driverTeams: DriverTeamPoint[];
}) {
  const driverColors = getDistinctDriverColors(
    driverTeams,
    rows.map((row) => row.driverCode)
  );

  return (
    <ResponsiveContainer width="100%" height={240} minWidth={1}>
      <BarChart
        data={rows}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgb(var(--surface-border))"
          horizontal={false}
        />

        <XAxis
          type="number"
          tick={{
            fill: "rgb(var(--text-secondary))",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
          }}
          axisLine={{ stroke: "rgb(var(--surface-border))" }}
          tickLine={false}
        />

        <YAxis
          type="category"
          dataKey="driverCode"
          width={48}
          tick={{
            fill: "rgb(var(--text-primary))",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
          }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          cursor={{ fill: "rgba(155,93,229,0.08)" }}
          content={<PoleTooltip />}
          contentStyle={{
            backgroundColor: "rgb(var(--surface-elevated))",
            color: "rgb(var(--text-primary))",
            border: "1px solid rgb(var(--surface-border))",
            borderRadius: 6,
            fontSize: 12,
            fontFamily: "var(--font-mono)",
          }}
          itemStyle={{ color: "rgb(var(--text-primary))" }}
        />

        <Bar dataKey="poles" radius={[0, 3, 3, 0]} maxBarSize={20}>
          {rows.map((row) => (
            <Cell key={row.driverCode} fill={driverColors[row.driverCode]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}