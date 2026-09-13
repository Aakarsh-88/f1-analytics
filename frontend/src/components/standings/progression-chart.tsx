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

import type {
  ChampionshipProgressionPoint,
  ConstructorChampionshipProgressionPoint,
} from "@/types/standings";
import { getDistinctComparisonColors } from "@/lib/comparison-colors";

const DEFAULT_LINE_COLOR = "#9B5DE5";
const CONSTRUCTOR_LINE_COLORS: Record<string, string> = {
  red_bull: "#3671C6",
  ferrari: "#E8002D",
  mercedes: "#27F4D2",
  mclaren: "#FF8000",
  aston_martin: "#229971",
  alpine: "#0093CC",
  williams: "#64C4FF",
  haas: "#B6BABD",
  sauber: "#52E252",
  rb: "#6692FF",
};

interface ProgressionChartProps {
  data: ChampionshipProgressionPoint[] | ConstructorChampionshipProgressionPoint[];
  series: string[];
  kind: "driver" | "constructor";
  seriesLabels?: Record<string, string>;
}

export function ProgressionChart({ data, series, kind, seriesLabels = {} }: ProgressionChartProps) {
  const colors = kind === "driver" ? {} : CONSTRUCTOR_LINE_COLORS;
  const seriesColors = getDistinctComparisonColors(
    series,
    Object.fromEntries(series.map((name) => [name, colors[name]]))
  );
  const tickValues = data
    .filter((_, index) => {
      const count = Math.min(6, data.length);
      if (count <= 1) return index === 0;
      return index % Math.max(1, Math.ceil((data.length - 1) / (count - 1))) === 0 || index === data.length - 1;
    })
    .map((point) => point.round);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--surface-border))" vertical={false} />
        <XAxis
          dataKey="round"
          ticks={tickValues}
          tickFormatter={(round) => `R${round}`}
          tick={{ fill: "rgb(var(--text-secondary))", fontSize: 11, fontFamily: "var(--font-mono)" }}
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
        {series.map((name) => (
          <Line
            key={name}
            type="monotone"
            dataKey={name}
            name={seriesLabels[name] ?? name}
            stroke={seriesColors[name] ?? DEFAULT_LINE_COLOR}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
