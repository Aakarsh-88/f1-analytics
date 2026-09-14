"use client";

import { DriverStandingsTable } from "@/components/standings/driver-standings-table";
import type { DriverStandingRow } from "@/types/standings";

export function DriverStandingsSection({ rows }: { rows: DriverStandingRow[] }) {
  return (
    <DriverStandingsTable rows={rows} />
  );
}
