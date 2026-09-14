import { Flag, Shield, Trophy, Users } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { WinsBySeasonChart } from "@/components/dashboard/wins-by-season-chart";
import { getConstructors } from "@/lib/api/constructors";
import { getDashboardStats } from "@/lib/api/dashboard";
import { getDrivers } from "@/lib/api/drivers";

export default async function DashboardPage() {
  const [stats, constructors, drivers] = await Promise.all([
    getDashboardStats(),
    getConstructors(),
    getDrivers(),
  ]);
  const topConstructors = constructors
    .filter((constructor) => constructor.championships > 0)
    .sort((a, b) => b.championships - a.championships || a.name.localeCompare(b.name))
    .slice(0, 3);
  const topDrivers = drivers
    .filter((driver) => driver.championships > 0)
    .sort((a, b) => b.championships - a.championships || a.fullName.localeCompare(b.fullName))
    .slice(0, 3);

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
          {stats.totalSeasons} seasons of Formula 1 history, at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Total Races" value={stats.totalRaces.toLocaleString()} icon={Flag} />
        <StatCard label="Total Drivers" value={stats.totalDrivers.toLocaleString()} icon={Users} />
        <StatCard
          label="Total Constructors"
          value={stats.totalConstructors.toLocaleString()}
          icon={Shield}
        />
        <StatCard label="Seasons" value={stats.totalSeasons} icon={Trophy} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Constructor Championships</CardTitle>
          </CardHeader>
          <WinsBySeasonChart data={topConstructors} />
        </Card>

        <div className="space-y-3">
          <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-secondary))]">
            Driver Championships
          </h2>
          {topDrivers.map((driver, index) => (
            <div
              key={driver.driverId}
              className="rounded-lg border-l-4 border-y border-r border-line bg-[rgb(var(--surface-card))] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl font-bold text-[rgb(var(--text-primary))]">
                  {index + 1}
                </span>
                <span className="font-mono text-sm tabular-nums text-[rgb(var(--text-secondary))]">
                  {driver.championships} World {driver.championships === 1 ? "Championship" : "Championships"}
                </span>
              </div>
              <p className="mt-2 font-display text-lg font-semibold text-[rgb(var(--text-primary))]">
                {driver.fullName}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
