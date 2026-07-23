import { notFound } from "next/navigation";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { WinsBySeasonChart } from "@/components/dashboard/wins-by-season-chart";
import { ResultsDistributionChart } from "@/components/drivers/results-distribution-chart";
import { getDriverDetail } from "@/lib/api/drivers";
import { Flag, Percent, TrendingUp, Trophy } from "lucide-react";

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ driverRef: string }>;
}) {
  const { driverRef } = await params;
  const detail = await getDriverDetail(driverRef);

  if (!detail) {
    notFound();
  }

  const { summary, totalRaces, averageFinish, dnfPercentage, winsBySeasonChart, resultsBreakdown } =
    detail;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[rgb(var(--text-secondary))]">
            {summary.nationality ?? "Unknown"}
            {summary.number !== null && ` · #${summary.number}`}
          </p>
          <h1 className="font-display text-2xl font-bold">{summary.fullName}</h1>
        </div>
        {summary.code && (
          <span className="rounded-md bg-[rgb(var(--surface-elevated))] px-3 py-1.5 font-mono text-lg font-bold tracking-wider">
            {summary.code}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Wins" value={summary.wins} icon={Trophy} />
        <StatCard label="Podiums" value={summary.podiums} icon={Flag} />
        <StatCard label="Titles" value={summary.championships} icon={Trophy} />
        <StatCard label="Win Rate" value={`${summary.winPercentage.toFixed(1)}%`} icon={Percent} />
        <StatCard label="Avg Finish" value={averageFinish.toFixed(1)} icon={TrendingUp} />
        <StatCard label="DNF Rate" value={`${dnfPercentage.toFixed(1)}%`} icon={Percent} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Wins by Season</CardTitle>
          </CardHeader>
          <WinsBySeasonChart data={winsBySeasonChart} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Career Results ({totalRaces} races)</CardTitle>
          </CardHeader>
          <ResultsDistributionChart breakdown={resultsBreakdown} />
        </Card>
      </div>
    </div>
  );
}
