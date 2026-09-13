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

import { getDistinctDriverColors } from "@/lib/analytics-driver-colors";
import type { DriverTeamPoint } from "@/types/analytics";
import type { PodiumTrendPoint } from "@/types/analytics";

interface PodiumTrendsChartProps {
  points: PodiumTrendPoint[];
  driverCodes: string[];
  driverTeams: DriverTeamPoint[];
}

export function PodiumTrendsChart({ points, driverCodes, driverTeams }: PodiumTrendsChartProps) {
  const driverColors = getDistinctDriverColors(driverTeams, driverCodes);

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
          allowDecimals={false}
          tick={{ fill: "rgb(var(--text-secondary))", fontSize: 12, fontFamily: "var(--font-mono)" }}
          axisLine={false}
          tickLine={false}
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
        />
        <Legend wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-mono)" }} />
        {driverCodes.map((code) => (
          <Line
            key={code}
            type="monotone"
            dataKey={code}
            stroke={driverColors[code]}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
