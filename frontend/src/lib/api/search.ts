import "server-only";

import { getConstructors } from "@/lib/api/constructors";
import { getDrivers } from "@/lib/api/drivers";
import { getRaces } from "@/lib/api/races";
import { getStandings } from "@/lib/api/standings";
import type { SearchItem } from "@/types/search";

/**
 * Aggregates a flat, searchable index across every section of the app —
 * drivers, constructors, races, and the standings page — for the global
 * search bar in the top nav. Built server-side (each source function is
 * itself server-only) and passed down to the client `TopNav` as plain
 * serializable data, so the client component never needs its own data
 * fetching or duplicate mock logic.
 *
 * The resource API modules own their backend requests, so this index stays
 * focused on mapping their real responses into the shared search shape.
 */
export async function getSearchIndex(): Promise<SearchItem[]> {
  const [drivers, constructors, races, standings] = await Promise.all([
    getDrivers(),
    getConstructors(),
    getRaces(),
    getStandings(),
  ]);

  const driverItems: SearchItem[] = drivers.map((d) => ({
    type: "driver",
    label: d.fullName,
    sublabel: d.nationality ?? undefined,
    href: `/drivers/${d.driverRef}`,
  }));

  const constructorItems: SearchItem[] = constructors.map((c) => ({
    type: "constructor",
    label: c.name,
    sublabel: c.nationality ?? undefined,
    href: `/constructors`,
  }));

  const raceItems: SearchItem[] = races.map((r) => ({
    type: "race",
    label: r.name,
    sublabel: `${r.circuitName} · ${r.year}`,
    href: `/races/${r.raceId}`,
  }));

  const pageItems: SearchItem[] = [
    {
      type: "page",
      label: `${standings.season} Championship Standings`,
      sublabel: "Drivers & Constructors",
      href: "/standings",
    },
    {
      type: "page",
      label: "Analytics",
      sublabel: "Constructor dominance, poles, fastest laps, podium trends",
      href: "/analytics",
    },
  ];

  return [...driverItems, ...constructorItems, ...raceItems, ...pageItems];
}
