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

import { DEFAULT_DRIVER_LINE_COLOR, DRIVER_LINE_COLORS } from "@/lib/driver-colors";
import type { PodiumTrendPoint } from "@/types/analytics";

interface PodiumTrendsChartProps {
  points: PodiumTrendPoint[];
  driverCodes: string[];
}

export function PodiumTrendsChart({ points, driverCodes }: PodiumTrendsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
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
            border: "1px solid rgb(var(--surface-border))",
            borderRadius: 6,
            fontSize: 12,
            fontFamily: "var(--font-mono)",
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-mono)" }} />
        {driverCodes.map((code) => (
          <Line
            key={code}
            type="monotone"
            dataKey={code}
            stroke={DRIVER_LINE_COLORS[code] ?? DEFAULT_DRIVER_LINE_COLOR}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
