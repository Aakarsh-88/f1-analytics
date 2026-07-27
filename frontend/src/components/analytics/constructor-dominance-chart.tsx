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

import type { ConstructorDominancePoint, ConstructorMeta } from "@/types/analytics";

const TEAM_LINE_COLORS: Record<string, string> = {
  mercedes: "#27F4D2",
  red_bull: "#3671C6",
  ferrari: "#E8002D",
  mclaren: "#FF8000",
};

interface ConstructorDominanceChartProps {
  points: ConstructorDominancePoint[];
  constructors: ConstructorMeta[];
}

export function ConstructorDominanceChart({ points, constructors }: ConstructorDominanceChartProps) {
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
        {constructors.map((c) => (
          <Line
            key={c.ref}
            type="monotone"
            dataKey={c.ref}
            name={c.name}
            stroke={TEAM_LINE_COLORS[c.ref] ?? "#9B5DE5"}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
