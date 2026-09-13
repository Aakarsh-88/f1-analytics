"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { ResultsBreakdown } from "@/types/driver";

const SLICE_COLORS = {
  wins: "#E10600",
  otherPodiums: "#FFB800",
  pointsFinishes: "#00B37E",
  noPointsFinishes: "#6B7280",
  dnfs: "#8B5CF6",
};

const SLICE_LABELS: Record<keyof ResultsBreakdown, string> = {
  wins: "Wins",
  otherPodiums: "Other Podiums",
  pointsFinishes: "Points Finishes",
  noPointsFinishes: "No Points",
  dnfs: "DNF",
};

export function ResultsDistributionChart({ breakdown }: { breakdown: ResultsBreakdown }) {
  const data = (Object.keys(breakdown) as (keyof ResultsBreakdown)[])
    .map((key) => ({ key, name: SLICE_LABELS[key], value: breakdown[key] }))
    .filter((slice) => slice.value > 0);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
          {data.map((slice) => (
            <Cell key={slice.key} fill={SLICE_COLORS[slice.key]} />
          ))}
        </Pie>
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
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-mono)" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
