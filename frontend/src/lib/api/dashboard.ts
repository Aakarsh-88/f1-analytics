import "server-only";

import type { DashboardStats } from "@/types/dashboard";

/**
 * TEMPORARY MOCK — replace the body of this function with a real fetch
 * once `backend/app/api/v1/dashboard.py` exists (planned for Milestone 7,
 * alongside analytics_service.py). Nothing else in the app needs to
 * change: every component below only imports `getDashboardStats` and
 * the `DashboardStats` type, never a URL or fetch call directly.
 *
 * Real implementation will look like:
 *
 *   const res = await fetch(`${process.env.API_BASE_URL}/api/v1/dashboard`, {
 *     next: { revalidate: 300 },
 *   });
 *   if (!res.ok) throw new Error("Failed to load dashboard stats");
 *   return res.json();
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  return {
    totalRaces: 1125,
    totalDrivers: 861,
    totalConstructors: 212,
    totalSeasons: 76,
    winsBySeasonChart: [
      { season: 2020, wins: 11 },
      { season: 2021, wins: 10 },
      { season: 2022, wins: 15 },
      { season: 2023, wins: 19 },
      { season: 2024, wins: 9 },
      { season: 2025, wins: 12 },
    ],
    latestRacePodium: [
      {
        position: 1,
        driverName: "Max Verstappen",
        constructorName: "Red Bull Racing",
        constructorRef: "red_bull",
        points: 25,
      },
      {
        position: 2,
        driverName: "Lando Norris",
        constructorName: "McLaren",
        constructorRef: "mclaren",
        points: 18,
      },
      {
        position: 3,
        driverName: "Charles Leclerc",
        constructorName: "Ferrari",
        constructorRef: "ferrari",
        points: 15,
      },
    ],
  };
}
