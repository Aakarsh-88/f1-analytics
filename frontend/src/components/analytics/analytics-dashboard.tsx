"use client";

import { useMemo, useState } from "react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { AverageQualifyingChart } from "@/components/analytics/average-qualifying-chart";
import { ConstructorDominanceChart } from "@/components/analytics/constructor-dominance-chart";
import { FastestLapsChart } from "@/components/analytics/fastest-laps-chart";
import { PodiumTrendsChart } from "@/components/analytics/podium-trends-chart";
import { PolePositionsChart } from "@/components/analytics/pole-positions-chart";
import { SavedViewsPanel } from "@/components/analytics/saved-views-panel";
import { SeasonRangeFilter } from "@/components/analytics/season-range-filter";
import type { AnalyticsData } from "@/types/analytics";

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const [fromYear, setFromYear] = useState(data.seasonRange.min);
  const [toYear, setToYear] = useState(data.seasonRange.max);

  function inRange(season: number) {
    return season >= fromYear && season <= toYear;
  }

  // Only the season-indexed datasets respond to the filter — the two
  // leaderboards (poles, fastest laps) are all-time totals by design and
  // are labeled as such below, rather than silently ignoring the filter.
  const filteredDominance = useMemo(
    () => data.constructorDominance.points.filter((p) => inRange(p.season)),
    [data.constructorDominance.points, fromYear, toYear]
  );
  const filteredAvgQualifying = useMemo(
    () => data.avgQualifying.points.filter((p) => inRange(p.season)),
    [data.avgQualifying.points, fromYear, toYear]
  );
  const filteredPodiumTrends = useMemo(
    () => data.podiumTrends.points.filter((p) => inRange(p.season)),
    [data.podiumTrends.points, fromYear, toYear]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[rgb(var(--text-secondary))]">
          Season-indexed charts below reflect this range:
        </p>
        <SeasonRangeFilter
          range={data.seasonRange}
          fromYear={fromYear}
          toYear={toYear}
          onChange={(f, t) => {
            setFromYear(f);
            setToYear(t);
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Constructor Dominance</CardTitle>
          </CardHeader>
          <ConstructorDominanceChart
            points={filteredDominance}
            constructors={data.constructorDominance.constructors}
          />
        </Card>

        <SavedViewsPanel fromYear={fromYear} toYear={toYear} onLoadView={(f, t) => {
          setFromYear(f);
          setToYear(t);
        }} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pole Positions (All-Time)</CardTitle>
          </CardHeader>
          <PolePositionsChart rows={data.poleLeaderboard} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fastest Laps (All-Time)</CardTitle>
          </CardHeader>
          <FastestLapsChart rows={data.fastestLapLeaderboard} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Average Qualifying Position</CardTitle>
          </CardHeader>
          <AverageQualifyingChart
            points={filteredAvgQualifying}
            driverCodes={data.avgQualifying.driverCodes}
          />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Podium Trends</CardTitle>
          </CardHeader>
          <PodiumTrendsChart
            points={filteredPodiumTrends}
            driverCodes={data.podiumTrends.driverCodes}
          />
        </Card>
      </div>
    </div>
  );
}
