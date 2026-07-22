"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

export function TrendSparkline({ data }: { data: { season: number; wins: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
        <Line
          type="monotone"
          dataKey="wins"
          stroke="#E10600"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
