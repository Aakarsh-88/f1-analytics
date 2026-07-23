import "server-only";

import type { DriverDetail, DriverSummary } from "@/types/driver";

/**
 * TEMPORARY MOCK — replace with a real fetch to
 * `${API_BASE_URL}/api/v1/drivers` once `backend/app/api/v1/drivers.py`
 * exists. The shape here (DriverSummary) is exactly what that endpoint
 * should return so the swap is a one-line change in this file only.
 */
export async function getDrivers(): Promise<DriverSummary[]> {
  return [
    {
      driverId: 1,
      driverRef: "hamilton",
      fullName: "Lewis Hamilton",
      code: "HAM",
      number: 44,
      nationality: "British",
      wins: 105,
      podiums: 202,
      championships: 7,
      winPercentage: 29.4,
    },
    {
      driverId: 2,
      driverRef: "verstappen",
      fullName: "Max Verstappen",
      code: "VER",
      number: 1,
      nationality: "Dutch",
      wins: 63,
      podiums: 105,
      championships: 4,
      winPercentage: 32.1,
    },
    {
      driverId: 3,
      driverRef: "schumacher",
      fullName: "Michael Schumacher",
      code: "MSC",
      number: null,
      nationality: "German",
      wins: 91,
      podiums: 155,
      championships: 7,
      winPercentage: 29.7,
    },
    {
      driverId: 4,
      driverRef: "norris",
      fullName: "Lando Norris",
      code: "NOR",
      number: 4,
      nationality: "British",
      wins: 8,
      podiums: 33,
      championships: 0,
      winPercentage: 6.2,
    },
  ];
}

/**
 * TEMPORARY MOCK — replace with a fetch to
 * `${API_BASE_URL}/api/v1/drivers/{driverRef}` once that endpoint exists.
 * That real endpoint should perform the wins-by-season aggregation and
 * results breakdown server-side (via analytics_service.py), returning
 * exactly this DriverDetail shape.
 */
export async function getDriverDetail(driverRef: string): Promise<DriverDetail | null> {
  const drivers = await getDrivers();
  const summary = drivers.find((d) => d.driverRef === driverRef);
  if (!summary) return null;

  const totalRaces = Math.round(summary.wins / (summary.winPercentage / 100));
  const dnfs = Math.round(totalRaces * 0.08);
  const otherPodiums = Math.max(summary.podiums - summary.wins, 0);
  const pointsFinishes = Math.max(Math.round(totalRaces * 0.55) - summary.podiums, 0);
  const noPointsFinishes = Math.max(totalRaces - summary.podiums - pointsFinishes - dnfs, 0);

  return {
    summary,
    totalRaces,
    averageFinish: Number((3 + (100 - summary.winPercentage) / 12).toFixed(1)),
    dnfPercentage: Number(((dnfs / totalRaces) * 100).toFixed(1)),
    winsBySeasonChart: buildMockSeasonWins(summary.wins),
    resultsBreakdown: {
      wins: summary.wins,
      otherPodiums,
      pointsFinishes,
      noPointsFinishes,
      dnfs,
    },
  };
}

/** Distributes a driver's total career wins across a plausible run of recent seasons for the chart demo. */
function buildMockSeasonWins(totalWins: number) {
  const seasons = [2020, 2021, 2022, 2023, 2024, 2025];
  const weights = [0.1, 0.22, 0.28, 0.2, 0.12, 0.08];
  let remaining = totalWins;
  const result = seasons.map((season, i) => {
    const wins = i === seasons.length - 1 ? remaining : Math.round(totalWins * weights[i]!);
    remaining -= wins;
    return { season, wins: Math.max(wins, 0) };
  });
  return result;
}
