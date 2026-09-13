import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { ConstructorStandingsSection } from "@/components/standings/constructor-standings-section";
import { DriverStandingsSection } from "@/components/standings/driver-standings-section";
import { ProgressionChart } from "@/components/standings/progression-chart";
import { SeasonSelector } from "@/components/standings/season-selector";
import { getDataSeasonRange } from "@/lib/api/data-range";
import { getStandings } from "@/lib/api/standings";

interface StandingsPageProps {
  searchParams: Promise<{ season?: string }>;
}

const DEFAULT_SEASON = 2024;

export default async function StandingsPage({ searchParams }: StandingsPageProps) {
  const params = await searchParams;
  const seasonRange = await getDataSeasonRange();
  const requestedSeason = Number(params.season);
  const season =
    Number.isInteger(requestedSeason) &&
    requestedSeason >= seasonRange.min &&
    requestedSeason <= seasonRange.max
      ? requestedSeason
      : DEFAULT_SEASON >= seasonRange.min && DEFAULT_SEASON <= seasonRange.max
        ? DEFAULT_SEASON
        : seasonRange.max;
  const standings = await getStandings(season);
  const seasons = Array.from(
    { length: seasonRange.max - seasonRange.min + 1 },
    (_, index) => seasonRange.max - index
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Championship</h1>
          <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
            {standings.season} season standings and progression.
          </p>
        </div>
        <SeasonSelector season={standings.season} seasons={seasons} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Driver Championship Progression</CardTitle>
          </CardHeader>
          <ProgressionChart
            data={standings.progression}
            series={standings.progressionDriverCodes}
            kind="driver"
          />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Constructor Championship Progression</CardTitle>
          </CardHeader>
          <ProgressionChart
            data={standings.constructorProgression}
            series={standings.progressionConstructorRefs}
            kind="constructor"
            seriesLabels={Object.fromEntries(
              standings.constructorStandings.map((row) => [row.constructorRef, row.constructorName])
            )}
          />
        </Card>
      </div>

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
              content: <DriverStandingsSection rows={standings.driverStandings} />,
            },
            {
              value: "constructors",
              label: "Constructors",
              content: <ConstructorStandingsSection rows={standings.constructorStandings} />,
            },
          ]}
        />
      </Card>
    </div>
  );
}
