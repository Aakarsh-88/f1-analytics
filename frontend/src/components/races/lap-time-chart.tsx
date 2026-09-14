"use client";

import { useMemo } from "react";
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

import type { LapTimePoint } from "@/types/race";
import { SortedTooltip } from "@/components/analytics/sorted-tooltip";

const DRIVER_LINE_COLORS: Record<string, string> = {
  VER: "#3671C6",
  NOR: "#FF8000",
  LEC: "#E8002D",
};

const DEFAULT_LINE_COLOR = "#9B5DE5";

/**
 * Reshapes flat (lap, driverCode, seconds) rows into one row per lap with
 * a column per driver — the shape Recharts' <Line> needs.
 */
type LapRow = {
  lap: number;
  [driverCode: string]: number;
};

function pivotByLap(points: LapTimePoint[]) {
  const laps = new Map<number, LapRow>();

  for (const point of points) {
    const row: LapRow = laps.get(point.lap) ?? { lap: point.lap };
    row[point.driverCode] = point.seconds;
    laps.set(point.lap, row);
  }

  return Array.from(laps.values()).sort((a, b) => a.lap - b.lap);
}

export function LapTimeChart({
  lapTimes,
}: {
  lapTimes: LapTimePoint[];
}) {
  const data = useMemo(() => pivotByLap(lapTimes), [lapTimes]);

  const driverCodes = useMemo(
    () => Array.from(new Set(lapTimes.map((p) => p.driverCode))),
    [lapTimes]
  );

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgb(var(--surface-border))"
          vertical={false}
        />

        <XAxis
          dataKey="lap"
          tick={{
            fill: "rgb(var(--text-secondary))",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
          }}
          axisLine={{ stroke: "rgb(var(--surface-border))" }}
          tickLine={false}
          label={{
            value: "Lap",
            position: "insideBottom",
            offset: -2,
            fontSize: 11,
          }}
        />

        <YAxis
          tick={{
            fill: "rgb(var(--text-secondary))",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
          }}
          axisLine={false}
          tickLine={false}
          unit="s"
          domain={["dataMin - 0.5", "dataMax + 0.5"]}
        />

        <Tooltip
          content={
            <SortedTooltip
              formatValue={(value) =>
                typeof value === "number" ? `${value.toFixed(3)}s` : String(value ?? "")
              }
            />
          }
          contentStyle={{
            backgroundColor: "rgb(var(--surface-elevated))",
            color: "rgb(var(--text-primary))",
            border: "1px solid rgb(var(--surface-border))",
            borderRadius: 6,
            fontSize: 12,
            fontFamily: "var(--font-mono)",
          }}
          itemStyle={{ color: "rgb(var(--text-primary))" }}
          labelFormatter={(lap) => `Lap ${lap}`}
        />

        <Legend
          wrapperStyle={{
            fontSize: 12,
            fontFamily: "var(--font-mono)",
          }}
        />

        {driverCodes.map((code) => (
          <Line
            key={code}
            type="monotone"
            dataKey={code}
            stroke={DRIVER_LINE_COLORS[code] ?? DEFAULT_LINE_COLOR}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}