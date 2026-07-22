import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { ConstructorStandingsTable } from "@/components/standings/constructor-standings-table";
import { DriverStandingsTable } from "@/components/standings/driver-standings-table";
import { ProgressionChart } from "@/components/standings/progression-chart";
import { getStandings } from "@/lib/api/standings";

export default async function StandingsPage() {
  const standings = await getStandings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Championship</h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
          {standings.season} season standings and progression.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Points Progression</CardTitle>
        </CardHeader>
        <ProgressionChart data={standings.progression} driverCodes={standings.progressionDriverCodes} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Standings</CardTitle>
        </CardHeader>
        <Tabs
          defaultValue="drivers"
          items={[
            {
              value: "drivers",
              label: "Drivers",
              content: <DriverStandingsTable rows={standings.driverStandings} />,
            },
            {
              value: "constructors",
              label: "Constructors",
              content: <ConstructorStandingsTable rows={standings.constructorStandings} />,
            },
          ]}
        />
      </Card>
    </div>
  );
}
