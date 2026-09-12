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

import { getDriverColor } from "@/lib/analytics-driver-colors";
import type { DriverTeamPoint, PoleLeaderboardRow } from "@/types/analytics";
import { Cell } from "recharts";

export function PolePositionsChart({
  rows,
  driverTeams,
}: {
  rows: PoleLeaderboardRow[];
  driverTeams: DriverTeamPoint[];
}) {
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
          contentStyle={{
            backgroundColor: "rgb(var(--surface-elevated))",
            border: "1px solid rgb(var(--surface-border))",
            borderRadius: 6,
            fontSize: 12,
            fontFamily: "var(--font-mono)",
          }}
          formatter={(value, name) => [
            typeof value === "number"
              ? `${value} pole positions`
              : String(value ?? ""),
            String(name),
          ]}
        />

        <Bar dataKey="poles" radius={[0, 3, 3, 0]} maxBarSize={20}>
          {rows.map((row) => (
            <Cell key={row.driverCode} fill={getDriverColor(driverTeams, row.driverCode)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}