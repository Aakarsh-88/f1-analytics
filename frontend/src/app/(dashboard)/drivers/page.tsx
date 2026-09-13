import { DriversGrid } from "@/components/drivers/drivers-grid";
import { getDrivers } from "@/lib/api/drivers";

export default async function DriversPage() {
  const drivers = await getDrivers();
  const sortedDrivers = [...drivers].sort(
    (a, b) => b.championships - a.championships || b.wins - a.wins
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Drivers</h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
          {drivers.length} drivers · Career wins, podiums, and championships.
        </p>
      </div>

      <DriversGrid drivers={sortedDrivers} />
    </div>
  );
}
