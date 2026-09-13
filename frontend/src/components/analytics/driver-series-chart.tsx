"use client";

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getDistinctDriverColors } from "@/lib/analytics-driver-colors";
import type { DriverSeriesPoint, DriverTeamPoint } from "@/types/analytics";

export function DriverSeriesChart({
  points,
  driverCodes,
  driverTeams,
  title,
  percentage = false,
  bar = false,
}: {
  points: DriverSeriesPoint[];
  driverCodes: string[];
  driverTeams: DriverTeamPoint[];
  title: string;
  percentage?: boolean;
  bar?: boolean;
}) {
  const colors = getDistinctDriverColors(driverTeams, driverCodes);
  const chartProps = {
    data: points,
    margin: { top: 8, right: 16, left: -8, bottom: 0 },
  };
  const tooltip = (
    <Tooltip
      contentStyle={{ backgroundColor: "rgb(var(--surface-elevated))", color: "rgb(var(--text-primary))", border: "1px solid rgb(var(--surface-border))" }}
      itemStyle={{ color: "rgb(var(--text-primary))" }}
      formatter={(value, name) => [percentage ? `${Number(value).toFixed(1)}%` : Number(value).toFixed(2), String(name)]}
    />
  );

  if (bar) {
    return (
      <ResponsiveContainer width="100%" height={280} minWidth={1}>
        <BarChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--surface-border))" vertical={false} />
          <XAxis type="category" dataKey="season" tick={{ fill: "rgb(var(--text-secondary))", fontSize: 12 }} axisLine={{ stroke: "rgb(var(--surface-border))" }} tickLine={false} />
          <YAxis type="number" tick={{ fill: "rgb(var(--text-secondary))", fontSize: 12 }} axisLine={false} tickLine={false} />
          {tooltip}
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {driverCodes.map((code) => <Bar key={code} dataKey={code} name={code} fill={colors[code]} radius={[0, 3, 3, 0]} maxBarSize={20} />)}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280} minWidth={1}>
      <LineChart data={points} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--surface-border))" vertical={false} />
        <XAxis dataKey="season" tick={{ fill: "rgb(var(--text-secondary))", fontSize: 12 }} axisLine={{ stroke: "rgb(var(--surface-border))" }} tickLine={false} />
        <YAxis tick={{ fill: "rgb(var(--text-secondary))", fontSize: 12 }} axisLine={false} tickLine={false} />
        {tooltip}
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {driverCodes.map((code) => (
          <Line key={code} type="monotone" dataKey={code} stroke={colors[code]} name={code} strokeWidth={2} dot={{ r: 3 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
