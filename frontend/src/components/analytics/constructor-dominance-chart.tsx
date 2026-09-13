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
import { getDistinctComparisonColors } from "@/lib/comparison-colors";

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
  const constructorColors = getDistinctComparisonColors(
    constructors.map((constructor) => constructor.ref),
    Object.fromEntries(
      constructors.map((constructor) => [constructor.ref, TEAM_LINE_COLORS[constructor.ref]])
    )
  );

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
        {constructors.map((c) => (
          <Line
            key={c.ref}
            type="monotone"
            dataKey={c.ref}
            name={c.name}
            stroke={constructorColors[c.ref]}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
