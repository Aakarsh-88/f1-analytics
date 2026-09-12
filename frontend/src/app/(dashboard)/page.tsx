import { Flag, Shield, Trophy, Users } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PodiumCard } from "@/components/dashboard/podium-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { WinsBySeasonChart } from "@/components/dashboard/wins-by-season-chart";
import { getDashboardStats } from "@/lib/api/dashboard";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
          {stats.totalSeasons} seasons of Formula 1 history, at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Races" value={stats.totalRaces.toLocaleString()} icon={Flag} />
        <StatCard label="Total Drivers" value={stats.totalDrivers.toLocaleString()} icon={Users} />
        <StatCard
          label="Total Constructors"
          value={stats.totalConstructors.toLocaleString()}
          icon={Shield}
        />
        <StatCard label="Seasons" value={stats.totalSeasons} icon={Trophy} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Wins by Season</CardTitle>
          </CardHeader>
          <WinsBySeasonChart data={stats.winsBySeasonChart} />
        </Card>

        <div className="space-y-3">
          <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-secondary))]">
            Latest Race Podium
          </h2>
          {stats.latestRacePodium.map((finisher) => (
            <PodiumCard key={finisher.position} finisher={finisher} />
          ))}
        </div>
      </div>
    </div>
  );
}
