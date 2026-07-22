import { RacesTable } from "@/components/races/races-table";
import { getRaces } from "@/lib/api/races";

export default async function RacesPage() {
  const races = await getRaces();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Race Explorer</h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
          {races.length} races · browse results, qualifying, and lap-by-lap data.
        </p>
      </div>

      <RacesTable races={races} />
    </div>
  );
}
