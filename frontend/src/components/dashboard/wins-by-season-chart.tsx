"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ConstructorSummary } from "@/types/constructor";

const CONSTRUCTOR_COLORS: Record<string, string> = {
  mercedes: "#27F4D2",
  red_bull: "#3671C6",
  ferrari: "#E8002D",
  mclaren: "#FF8000",
  aston_martin: "#229971",
  alpine: "#0093CC",
  williams: "#64C4FF",
  rb: "#6692FF",
  sauber: "#52E252",
  haas: "#B6BABD",
};

const DEFAULT_CONSTRUCTOR_COLOR = "#6B7280";
type SeasonWins = { season: number; wins: number };
type ChartData = ConstructorSummary[] | SeasonWins[];

export function WinsBySeasonChart({ data }: { data: ChartData }) {
  const constructorData =
    data.length > 0 && "constructorRef" in data[0]! ? (data as ConstructorSummary[]) : null;
  const isConstructorData = constructorData !== null;
  const chartData: { label: string | number; value: number; constructorRef?: string }[] =
    constructorData
      ? constructorData.map((constructor) => ({
          label: constructor.name,
          value: constructor.championships,
          constructorRef: constructor.constructorRef,
        }))
      : (data as SeasonWins[]).map((season) => ({
          label: season.season,
          value: season.wins,
        }));

  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-[rgb(var(--text-secondary))]">
        No {isConstructorData ? "constructor championship" : "season win"} data is available yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260} minWidth={1}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--surface-border))" vertical={false} />
        <XAxis
          dataKey="label"
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
          cursor={{ fill: "rgba(225,6,0,0.06)" }}
          contentStyle={{
            backgroundColor: "rgb(var(--surface-elevated))",
            color: "rgb(var(--text-primary))",
            border: "1px solid rgb(var(--surface-border))",
            borderRadius: 6,
            fontSize: 12,
            fontFamily: "var(--font-mono)",
          }}
          labelStyle={{ color: "rgb(var(--text-primary))", fontWeight: 600 }}
          itemStyle={{ color: "rgb(var(--text-primary))" }}
          formatter={(value) => [value, isConstructorData ? "Titles" : "Wins"]}
        />
        <Bar
          dataKey="value"
          fill={isConstructorData ? undefined : "#E10600"}
          radius={[3, 3, 0, 0]}
          maxBarSize={isConstructorData ? 56 : 36}
        >
          {isConstructorData &&
            constructorData.map((constructor) => {
              return (
                <Cell
                  key={constructor.constructorRef}
                  fill={
                    CONSTRUCTOR_COLORS[constructor.constructorRef] ?? DEFAULT_CONSTRUCTOR_COLOR
                  }
                />
              );
            })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
