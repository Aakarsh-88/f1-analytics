import { RaceSeasonSelector } from "@/components/races/season-selector";
import { RacesTable } from "@/components/races/races-table";
import { getDataSeasonRange } from "@/lib/api/data-range";
import { getRaces } from "@/lib/api/races";

interface RacesPageProps {
  searchParams: Promise<{ season?: string }>;
}

const DEFAULT_SEASON = 2024;

export default async function RacesPage({ searchParams }: RacesPageProps) {
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
  const races = await getRaces(season);
  const seasons = Array.from(
    { length: seasonRange.max - seasonRange.min + 1 },
    (_, index) => seasonRange.max - index
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Race Explorer</h1>
          <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
            {races.length} races in {season} · Browse results, qualifying, and lap-by-lap data.
          </p>
        </div>
        <RaceSeasonSelector season={season} seasons={seasons} />
      </div>

      <RacesTable races={races} />
    </div>
  );
}
