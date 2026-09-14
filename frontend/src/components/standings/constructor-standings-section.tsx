"use client";

import { ConstructorStandingsTable } from "@/components/standings/constructor-standings-table";
import type { ConstructorStandingRow } from "@/types/standings";

export function ConstructorStandingsSection({ rows }: { rows: ConstructorStandingRow[] }) {
  return (
    <ConstructorStandingsTable rows={rows} />
  );
}
