"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { AverageQualifyingChart } from "@/components/analytics/average-qualifying-chart";
import { ConstructorDominanceChart } from "@/components/analytics/constructor-dominance-chart";
import { FastestLapsChart } from "@/components/analytics/fastest-laps-chart";
import { PodiumTrendsChart } from "@/components/analytics/podium-trends-chart";
import { PolePositionsChart } from "@/components/analytics/pole-positions-chart";
import { SavedViewsPanel } from "@/components/analytics/saved-views-panel";
import { SeasonRangeFilter } from "@/components/analytics/season-range-filter";
import type { AnalyticsData } from "@/types/analytics";

const MAX_COMPARISONS = 5;
const DEFAULT_COMPARISONS = 3;

function topDriverCodes(data: AnalyticsData): string[] {
  const scores = new Map<string, number>();

  for (const row of data.poleLeaderboard) {
    scores.set(row.driverCode, (scores.get(row.driverCode) ?? 0) + row.poles);
  }
  for (const row of data.fastestLapLeaderboard) {
    scores.set(row.driverCode, (scores.get(row.driverCode) ?? 0) + row.fastestLaps);
  }

  const availableCodes = new Set([
    ...data.avgQualifying.driverCodes,
    ...data.podiumTrends.driverCodes,
  ]);

  return [...scores.keys()]
    .filter((code) => availableCodes.has(code))
    .sort((a, b) => (scores.get(b) ?? 0) - (scores.get(a) ?? 0) || a.localeCompare(b))
    .slice(0, DEFAULT_COMPARISONS);
}

function topConstructorRefs(data: AnalyticsData): string[] {
  const scores = new Map<string, number>();

  for (const point of data.constructorDominance.points) {
    for (const constructor of data.constructorDominance.constructors) {
      const value = point[constructor.ref];
      if (typeof value === "number") {
        scores.set(constructor.ref, (scores.get(constructor.ref) ?? 0) + value);
      }
    }
  }

  return data.constructorDominance.constructors
    .map((constructor) => constructor.ref)
    .sort((a, b) => (scores.get(b) ?? 0) - (scores.get(a) ?? 0) || a.localeCompare(b))
    .slice(0, DEFAULT_COMPARISONS);
}

function filterDynamicPoints<T extends { season: number }>(
  points: T[],
  selectedKeys: string[]
): T[] {
  return points.map((point) => {
    const filtered: Record<string, number | string> = { season: point.season };
    for (const key of selectedKeys) {
      const value = (point as Record<string, number | string>)[key];
      if (typeof value === "number") {
        filtered[key] = value;
      }
    }
    return filtered as T;
  });
}

interface ComparisonPickerProps {
  title: string;
  selected: { id: string; label: string }[];
  options: { id: string; label: string }[];
  query: string;
  onQueryChange: (query: string) => void;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  max: number;
}

function ComparisonPicker({
  title,
  selected,
  options,
  query,
  onQueryChange,
  onAdd,
  onRemove,
  max,
}: ComparisonPickerProps) {
  const matches = options
    .filter((option) => {
      const search = query.trim().toLowerCase();
      return !search || option.label.toLowerCase().includes(search);
    })
    .slice(0, 8);
  const atLimit = selected.length >= max;

  return (
    <div className="min-w-0 flex-1 rounded-md border border-line bg-[rgb(var(--surface-card))] p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-secondary))]">
          {title}
        </label>
        <span className="font-mono text-[10px] text-[rgb(var(--text-secondary))]">
          {selected.length}/{max}
        </span>
      </div>

      <div className="mb-2 flex min-h-7 flex-wrap gap-1.5">
        {selected.length === 0 ? (
          <span className="text-xs text-[rgb(var(--text-secondary))]">Nothing selected</span>
        ) : (
          selected.map((item) => (
            <span
              key={item.id}
              className="inline-flex max-w-full items-center gap-1 rounded bg-[rgb(var(--surface-elevated))] px-2 py-1 text-xs"
            >
              <span className="truncate">{item.label}</span>
              <button
                type="button"
                aria-label={`Remove ${item.label}`}
                onClick={() => onRemove(item.id)}
                className="shrink-0 rounded p-0.5 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--surface-card))] hover:text-f1-red"
              >
                <X size={12} />
              </button>
            </span>
          ))
        )}
      </div>

      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-secondary))]"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={`Search ${title.toLowerCase()}…`}
          aria-label={`Search ${title.toLowerCase()}`}
          className="w-full rounded-md border border-line bg-[rgb(var(--surface-elevated))] py-1.5 pl-8 pr-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-f1-red"
        />
      </div>

      {atLimit ? (
        <p className="mt-2 text-[10px] text-[rgb(var(--text-secondary))]">
          Maximum of {max} selected. Remove one to add another.
        </p>
      ) : matches.length === 0 ? (
        <p className="mt-2 text-xs text-[rgb(var(--text-secondary))]">
          No {title.toLowerCase()} match.
        </p>
      ) : (
        <div className="mt-2 flex max-h-28 flex-wrap gap-1 overflow-y-auto">
          {matches.map((option) => {
            const isSelected = selected.some((item) => item.id === option.id);
            return (
              <button
                key={option.id}
                type="button"
                disabled={isSelected}
                onClick={() => onAdd(option.id)}
                className="rounded border border-line px-2 py-1 text-left text-xs text-[rgb(var(--text-secondary))] hover:border-f1-red hover:text-[rgb(var(--text-primary))] disabled:cursor-default disabled:opacity-50"
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const [fromYear, setFromYear] = useState(data.seasonRange.min);
  const [toYear, setToYear] = useState(data.seasonRange.max);
  const [selectedDriverCodes, setSelectedDriverCodes] = useState(() =>
    topDriverCodes(data).slice(0, MAX_COMPARISONS)
  );
  const [selectedConstructorRefs, setSelectedConstructorRefs] = useState(() =>
    topConstructorRefs(data).slice(0, MAX_COMPARISONS)
  );
  const [driverQuery, setDriverQuery] = useState("");
  const [constructorQuery, setConstructorQuery] = useState("");

  function inRange(season: number) {
    return season >= fromYear && season <= toYear;
  }

  // Selection updates for the upcoming comparison controls are capped so a
  // user can never add more than MAX_COMPARISONS series to a chart.
  function addDriver(code: string) {
    setSelectedDriverCodes((current) =>
      current.includes(code) || current.length >= MAX_COMPARISONS
        ? current
        : [...current, code]
    );
  }

  function addConstructor(ref: string) {
    setSelectedConstructorRefs((current) =>
      current.includes(ref) || current.length >= MAX_COMPARISONS
        ? current
        : [...current, ref]
    );
  }

  // Only the season-indexed datasets respond to the filter — the two
  // leaderboards (poles, fastest laps) are all-time totals by design and
  // are labeled as such below, rather than silently ignoring the filter.
  const filteredDominance = useMemo(
    () =>
      filterDynamicPoints(
        data.constructorDominance.points.filter((p) => inRange(p.season)),
        selectedConstructorRefs
      ),
    [data.constructorDominance.points, fromYear, toYear, selectedConstructorRefs]
  );
  const filteredAvgQualifying = useMemo(
    () =>
      filterDynamicPoints(
        data.avgQualifying.points.filter((p) => inRange(p.season)),
        selectedDriverCodes
      ),
    [data.avgQualifying.points, fromYear, toYear, selectedDriverCodes]
  );
  const filteredPodiumTrends = useMemo(
    () =>
      filterDynamicPoints(
        data.podiumTrends.points.filter((p) => inRange(p.season)),
        selectedDriverCodes
      ),
    [data.podiumTrends.points, fromYear, toYear, selectedDriverCodes]
  );
  const filteredDriverCodes = useMemo(
    () => selectedDriverCodes.filter((code) => data.avgQualifying.driverCodes.includes(code)),
    [data.avgQualifying.driverCodes, selectedDriverCodes]
  );
  const filteredPoleLeaderboard = useMemo(
    () => data.poleLeaderboard.filter((row) => selectedDriverCodes.includes(row.driverCode)),
    [data.poleLeaderboard, selectedDriverCodes]
  );
  const filteredFastestLapLeaderboard = useMemo(
    () =>
      data.fastestLapLeaderboard.filter((row) => selectedDriverCodes.includes(row.driverCode)),
    [data.fastestLapLeaderboard, selectedDriverCodes]
  );
  const filteredConstructors = useMemo(
    () =>
      data.constructorDominance.constructors.filter((constructor) =>
        selectedConstructorRefs.includes(constructor.ref)
      ),
    [data.constructorDominance.constructors, selectedConstructorRefs]
  );
  const filteredPodiumDriverCodes = useMemo(
    () => selectedDriverCodes.filter((code) => data.podiumTrends.driverCodes.includes(code)),
    [data.podiumTrends.driverCodes, selectedDriverCodes]
  );
  const driverNames = useMemo(() => {
    const names = new Map<string, string>();
    for (const row of [...data.poleLeaderboard, ...data.fastestLapLeaderboard]) {
      names.set(row.driverCode, row.driverName);
    }
    return names;
  }, [data.fastestLapLeaderboard, data.poleLeaderboard]);
  const driverOptions = useMemo(
    () =>
      [...new Set([...data.avgQualifying.driverCodes, ...data.podiumTrends.driverCodes])]
        .sort((a, b) => (driverNames.get(a) ?? a).localeCompare(driverNames.get(b) ?? b))
        .map((code) => ({
          id: code,
          label: driverNames.get(code) ? `${driverNames.get(code)} (${code})` : code,
        })),
    [data.avgQualifying.driverCodes, data.podiumTrends.driverCodes, driverNames]
  );
  const constructorOptions = useMemo(
    () =>
      data.constructorDominance.constructors.map((constructor) => ({
        id: constructor.ref,
        label: constructor.name,
      })),
    [data.constructorDominance.constructors]
  );
  const selectedDriverItems = selectedDriverCodes.map((code) => ({
    id: code,
    label: driverNames.get(code) ? `${driverNames.get(code)} (${code})` : code,
  }));
  const selectedConstructorItems = selectedConstructorRefs
    .map((ref) => data.constructorDominance.constructors.find((constructor) => constructor.ref === ref))
    .filter((constructor): constructor is NonNullable<typeof constructor> => Boolean(constructor))
    .map((constructor) => ({ id: constructor.ref, label: constructor.name }));

  void addDriver;
  void addConstructor;

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

      <div className="rounded-lg border border-line bg-[rgb(var(--surface-card))] p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-secondary))]">
              Compare
            </h2>
            <p className="mt-1 text-xs text-[rgb(var(--text-secondary))]">
              Choose up to {MAX_COMPARISONS} items per chart.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <ComparisonPicker
            title="Drivers"
            selected={selectedDriverItems}
            options={driverOptions}
            query={driverQuery}
            onQueryChange={setDriverQuery}
            onAdd={addDriver}
            onRemove={(code) =>
              setSelectedDriverCodes((current) => current.filter((item) => item !== code))
            }
            max={MAX_COMPARISONS}
          />
          <ComparisonPicker
            title="Constructors"
            selected={selectedConstructorItems}
            options={constructorOptions}
            query={constructorQuery}
            onQueryChange={setConstructorQuery}
            onAdd={addConstructor}
            onRemove={(ref) =>
              setSelectedConstructorRefs((current) => current.filter((item) => item !== ref))
            }
            max={MAX_COMPARISONS}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Constructor Dominance</CardTitle>
          </CardHeader>
          <ConstructorDominanceChart
            points={filteredDominance}
            constructors={filteredConstructors}
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
          <PolePositionsChart rows={filteredPoleLeaderboard} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fastest Laps (All-Time)</CardTitle>
          </CardHeader>
          <FastestLapsChart rows={filteredFastestLapLeaderboard} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Average Qualifying Position</CardTitle>
          </CardHeader>
          <AverageQualifyingChart
            points={filteredAvgQualifying}
            driverCodes={filteredDriverCodes}
          />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Podium Trends</CardTitle>
          </CardHeader>
          <PodiumTrendsChart
            points={filteredPodiumTrends}
            driverCodes={filteredPodiumDriverCodes}
          />
        </Card>
      </div>
    </div>
  );
}
