"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getDriverColor, getDriverSeasonColor } from "@/lib/analytics-driver-colors";
import type { DriverTeamPoint } from "@/types/analytics";
import type { AvgQualifyingPoint } from "@/types/analytics";

interface AverageQualifyingChartProps {
  points: AvgQualifyingPoint[];
  driverCodes: string[];
  driverTeams: DriverTeamPoint[];
}

export function AverageQualifyingChart({ points, driverCodes, driverTeams }: AverageQualifyingChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280} minWidth={1}>
      <LineChart data={points} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--surface-border))" vertical={false} />
        <XAxis
          dataKey="season"
          tick={{ fill: "rgb(var(--text-secondary))", fontSize: 12, fontFamily: "var(--font-mono)" }}
          axisLine={{ stroke: "rgb(var(--surface-border))" }}
          tickLine={false}
        />
        <YAxis
          // Reversed: P1 (best) renders at the top of the chart, matching
          // how a fan reads "qualifying improved" as an upward line —
          // the raw numbers get smaller as performance gets better.
          reversed
          allowDecimals={false}
          domain={[1, "dataMax + 1"]}
          tick={{ fill: "rgb(var(--text-secondary))", fontSize: 12, fontFamily: "var(--font-mono)" }}
          axisLine={false}
          tickLine={false}
          label={{ value: "Avg. grid position", angle: -90, position: "insideLeft", fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgb(var(--surface-elevated))",
            color: "rgb(var(--text-primary))",
            border: "1px solid rgb(var(--surface-border))",
            borderRadius: 6,
            fontSize: 12,
            fontFamily: "var(--font-mono)",
          }}
          itemStyle={{ color: "rgb(var(--text-primary))" }}
          formatter={(value, name) => [
  typeof value === "number"
    ? value.toFixed(1)
    : String(value ?? ""),
  String(name),
]}
        />
        <Legend wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-mono)" }} />
        {driverCodes.map((code) => (
          <Line
            key={code}
            type="monotone"
            dataKey={code}
            stroke={getDriverColor(driverTeams, code)}
            strokeWidth={2}
            dot={({ cx, cy, payload }) => (
              <circle
                cx={cx}
                cy={cy}
                r={3}
                fill={getDriverSeasonColor(driverTeams, code, payload.season)}
                stroke={getDriverSeasonColor(driverTeams, code, payload.season)}
              />
            )}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
