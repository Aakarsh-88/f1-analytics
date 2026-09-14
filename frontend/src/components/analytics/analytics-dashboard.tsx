"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { AverageQualifyingChart } from "@/components/analytics/average-qualifying-chart";
import { ConstructorDominanceChart } from "@/components/analytics/constructor-dominance-chart";
import { DriverSeriesChart } from "@/components/analytics/driver-series-chart";
import { PolePositionsChart } from "@/components/analytics/pole-positions-chart";
import { SavedViewsPanel } from "@/components/analytics/saved-views-panel";
import { SeasonRangeFilter } from "@/components/analytics/season-range-filter";
import type { AnalyticsData } from "@/types/analytics";

const MAX = 5;

function filterPoints<T extends { season: number }>(points: T[], keys: string[], from: number, to: number) {
  return points
    .filter((point) => point.season >= from && point.season <= to)
    .map((point) => {
      const result: Record<string, number | string> = { season: point.season };
      keys.forEach((key) => {
        const value = (point as Record<string, number | string>)[key];
        if (typeof value === "number") result[key] = value;
      });
      return result as T;
    });
}

function Picker({ title, selected, options, query, setQuery, add, remove }: {
  title: string; selected: string[]; options: { id: string; label: string }[];
  query: string; setQuery: (value: string) => void; add: (id: string) => void; remove: (id: string) => void;
}) {
  const matches = options.filter((option) => !query.trim() || option.label.toLowerCase().includes(query.toLowerCase())).slice(0, 8);
  return (
    <div className="rounded-md border border-line bg-[rgb(var(--surface-card))] p-3">
      <div className="mb-2 flex justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-secondary))]">{title}</span><span className="font-mono text-[10px]">{selected.length}/{MAX}</span></div>
      <div className="mb-2 flex min-h-7 flex-wrap gap-1.5">{selected.map((id) => {
        const label = options.find((option) => option.id === id)?.label ?? id;
        return <span key={id} className="inline-flex items-center gap-1 rounded bg-[rgb(var(--surface-elevated))] px-2 py-1 text-xs">{label}<button type="button" onClick={() => remove(id)} aria-label={`Remove ${label}`}><X size={12} /></button></span>;
      })}</div>
      <div className="relative"><Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${title.toLowerCase()}…`} className="w-full rounded-md border border-line bg-[rgb(var(--surface-elevated))] py-1.5 pl-8 text-xs" /></div>
      <div className="mt-2 flex flex-wrap gap-1">{matches.map((option) => <button key={option.id} type="button" disabled={selected.includes(option.id) || selected.length >= MAX} onClick={() => add(option.id)} className="rounded border border-line px-2 py-1 text-xs disabled:opacity-50">{option.label}</button>)}</div>
    </div>
  );
}

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const defaultFromYear = Math.max(data.seasonRange.min, Math.min(2014, data.seasonRange.max));
  const defaultToYear = Math.max(defaultFromYear, Math.min(2024, data.seasonRange.max));
  const [driverFromYear, setDriverFromYear] = useState(defaultFromYear);
  const [driverToYear, setDriverToYear] = useState(defaultToYear);
  const [constructorFromYear, setConstructorFromYear] = useState(defaultFromYear);
  const [constructorToYear, setConstructorToYear] = useState(defaultToYear);
  const [drivers, setDrivers] = useState(
    data.avgQualifying.driverCodes.filter((id) => ["HAM", "VER"].includes(id)).slice(0, 2)
  );
  const [constructors, setConstructors] = useState(
    data.constructorDominance.constructors
      .filter((item) => ["mercedes", "ferrari", "red_bull"].includes(item.ref))
      .map((item) => item.ref)
      .slice(0, 3)
  );
  const [driverQuery, setDriverQuery] = useState("");
  const [constructorQuery, setConstructorQuery] = useState("");
  const driverNames = new Map([...data.poleLeaderboard, ...data.fastestLapLeaderboard].map((row) => [row.driverCode, row.driverName]));
  const driverOptions = data.avgQualifying.driverCodes.map((id) => ({ id, label: driverNames.get(id) ? `${driverNames.get(id)} (${id})` : id }));
  const constructorOptions = data.constructorDominance.constructors.map((item) => ({ id: item.ref, label: item.name }));
  const driverTeams = data.driverTeams ?? [];
  const filtered = <T extends { season: number }>(points: T[] | undefined) => filterPoints(points ?? [], drivers, driverFromYear, driverToYear);
  const filteredConstructors = data.constructorDominance.constructors.filter((item) => constructors.includes(item.ref));
  const selectedPole = data.poleLeaderboard.filter((row) => drivers.includes(row.driverCode));
  const raceWins = data.raceWins ?? { points: [] };
  const avgFinishing = data.avgFinishing ?? { points: [] };
  const podiumPercentage = data.podiumPercentage ?? { points: [] };

  return <div className="space-y-6">
    <Card><CardHeader><CardTitle>Constructor Analytics</CardTitle></CardHeader><div className="space-y-4 p-4">
      <Picker title="Constructors" selected={constructors} options={constructorOptions} query={constructorQuery} setQuery={setConstructorQuery} add={(id) => setConstructors((current) => current.length < MAX && !current.includes(id) ? [...current, id] : current)} remove={(id) => setConstructors((current) => current.filter((item) => item !== id))} />
      <SeasonRangeFilter
        range={data.seasonRange}
        fromYear={constructorFromYear}
        toYear={constructorToYear}
        labelPrefix="Constructor "
        onChange={(from, to) => { setConstructorFromYear(from); setConstructorToYear(to); }}
      />
      <ConstructorDominanceChart points={filterPoints(data.constructorDominance.points, constructors, constructorFromYear, constructorToYear)} constructors={filteredConstructors} />
      <SavedViewsPanel namespace="constructors" title="Constructor Saved Views" fromYear={constructorFromYear} toYear={constructorToYear} selectedIds={constructors} onLoadView={(from, to, selectedIds) => { setConstructorFromYear(from); setConstructorToYear(to); if (selectedIds) setConstructors(selectedIds.slice(0, MAX)); }} />
    </div></Card>

    <Card><CardHeader><CardTitle>Driver Analytics</CardTitle></CardHeader><div className="space-y-4 p-4">
      <Picker title="Drivers" selected={drivers} options={driverOptions} query={driverQuery} setQuery={setDriverQuery} add={(id) => setDrivers((current) => current.length < MAX && !current.includes(id) ? [...current, id] : current)} remove={(id) => setDrivers((current) => current.filter((item) => item !== id))} />
      <SavedViewsPanel namespace="drivers" title="Driver Saved Views" fromYear={driverFromYear} toYear={driverToYear} selectedIds={drivers} onLoadView={(from, to, selectedIds) => { setDriverFromYear(from); setDriverToYear(to); if (selectedIds) setDrivers(selectedIds.slice(0, MAX)); }} />
      <SeasonRangeFilter range={data.seasonRange} fromYear={driverFromYear} toYear={driverToYear} labelPrefix="Driver " onChange={(from, to) => { setDriverFromYear(from); setDriverToYear(to); }} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Pole Positions</CardTitle></CardHeader><PolePositionsChart rows={selectedPole.filter((row) => data.avgQualifying.points.some((point) => point.season >= driverFromYear && point.season <= driverToYear && point[row.driverCode] !== undefined))} driverTeams={driverTeams} /></Card>
        <Card><CardHeader><CardTitle>AVERAGE QUALIFYING POSITION (LOWER IS BETTER)</CardTitle></CardHeader><AverageQualifyingChart points={filtered(data.avgQualifying.points)} driverCodes={drivers} driverTeams={driverTeams} /></Card>
        <Card><CardHeader><CardTitle>Races Won</CardTitle></CardHeader><DriverSeriesChart points={filtered(raceWins.points)} driverCodes={drivers} driverTeams={driverTeams} title="Races won" bar /></Card>
        <Card><CardHeader><CardTitle>Average Finishing Position (LOWER IS BETTER)</CardTitle></CardHeader><DriverSeriesChart points={filtered(avgFinishing.points)} driverCodes={drivers} driverTeams={driverTeams} title="Average finish" lowerIsBetter /></Card>
        <Card><CardHeader><CardTitle>Podium Trends</CardTitle></CardHeader><DriverSeriesChart points={filtered(data.podiumTrends.points)} driverCodes={drivers} driverTeams={driverTeams} title="Podiums" bar /></Card>
        <Card><CardHeader><CardTitle>Podium Percentage</CardTitle></CardHeader><DriverSeriesChart points={filtered(podiumPercentage.points)} driverCodes={drivers} driverTeams={driverTeams} title="Podium percentage" percentage /></Card>
      </div>
    </div></Card>
  </div>;
}
