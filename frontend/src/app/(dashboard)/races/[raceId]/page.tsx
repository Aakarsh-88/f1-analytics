import { notFound } from "next/navigation";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { LapTimeChart } from "@/components/races/lap-time-chart";
import { PitStopsTable } from "@/components/races/pit-stops-table";
import { QualifyingTable } from "@/components/races/qualifying-table";
import { ResultsTable } from "@/components/races/results-table";
import { getRaceDetail } from "@/lib/api/races";

export default async function RaceDetailPage({ params }: { params: Promise<{ raceId: string }> }) {
  const { raceId } = await params;
  const detail = await getRaceDetail(Number(raceId));

  if (!detail) {
    notFound();
  }

  const { race, results, qualifying, pitStops, lapTimes } = detail;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-[rgb(var(--text-secondary))]">
          Round {race.round} · {race.year} Season
        </p>
        <h1 className="font-display text-2xl font-bold">{race.name}</h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
          {race.circuitName}
          {race.country && ` · ${race.country}`} · {race.date}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session Data</CardTitle>
        </CardHeader>
        <Tabs
          defaultValue="results"
          items={[
            { value: "results", label: "Results", content: <ResultsTable results={results} /> },
            {
              value: "qualifying",
              label: "Qualifying",
              content: <QualifyingTable sessions={qualifying} />,
            },
            {
              value: "pit-stops",
              label: "Pit Stops",
              content: <PitStopsTable pitStops={pitStops} />,
            },
            {
              value: "lap-times",
              label: "Lap-by-Lap",
              content: <LapTimeChart lapTimes={lapTimes} />,
            },
          ]}
        />
      </Card>
    </div>
  );
}
