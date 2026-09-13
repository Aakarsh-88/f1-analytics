import type { DriverTeamPoint } from "@/types/analytics";
import { getDistinctComparisonColors } from "@/lib/comparison-colors";

export const DEFAULT_ANALYTICS_DRIVER_COLOR = "#6B7280";

export function getDriverSeasonColor(
  driverTeams: DriverTeamPoint[],
  driverCode: string,
  season: number
): string {
  const point = driverTeams.find(
    (item) => item.driverCode === driverCode && item.season === season
  );
  const constructor = point?.constructors.length === 1 ? point.constructors[0] : undefined;
  return constructor?.color ?? DEFAULT_ANALYTICS_DRIVER_COLOR;
}

export function getDriverColor(driverTeams: DriverTeamPoint[], driverCode: string): string {
  const counts = new Map<string, number>();
  for (const point of driverTeams) {
    if (point.driverCode !== driverCode) continue;
    for (const constructor of point.constructors) {
      counts.set(constructor.color, (counts.get(constructor.color) ?? 0) + 1);
    }
  }
  return (
    [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ??
    DEFAULT_ANALYTICS_DRIVER_COLOR
  );
}

export function getDistinctDriverColors(
  driverTeams: DriverTeamPoint[],
  driverCodes: string[]
): Record<string, string> {
  const preferredColors = Object.fromEntries(
    driverCodes.map((code) => [code, getDriverColor(driverTeams, code)])
  );
  return getDistinctComparisonColors(driverCodes, preferredColors);
}

export function getDistinctDriverSeasonColors(
  driverTeams: DriverTeamPoint[],
  driverCodes: string[],
  season: number
): Record<string, string> {
  const preferredColors = Object.fromEntries(
    driverCodes.map((code) => [code, getDriverSeasonColor(driverTeams, code, season)])
  );
  return getDistinctComparisonColors(driverCodes, preferredColors);
}
