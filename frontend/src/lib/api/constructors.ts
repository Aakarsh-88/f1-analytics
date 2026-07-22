import "server-only";

import type { ConstructorSummary } from "@/types/constructor";

/**
 * TEMPORARY MOCK — replace with a fetch to `${API_BASE_URL}/api/v1/constructors`
 * once `backend/app/api/v1/constructors.py` exists. Shape matches what
 * that endpoint should return.
 */
export async function getConstructors(): Promise<ConstructorSummary[]> {
  return [
    {
      constructorId: 1,
      constructorRef: "ferrari",
      name: "Ferrari",
      nationality: "Italian",
      wins: 243,
      championships: 16,
      podiums: 830,
      firstSeason: 1950,
      recentTrend: [
        { season: 2021, wins: 0 },
        { season: 2022, wins: 4 },
        { season: 2023, wins: 1 },
        { season: 2024, wins: 3 },
        { season: 2025, wins: 2 },
      ],
    },
    {
      constructorId: 2,
      constructorRef: "mercedes",
      name: "Mercedes",
      nationality: "German",
      wins: 125,
      championships: 8,
      podiums: 300,
      firstSeason: 1954,
      recentTrend: [
        { season: 2021, wins: 9 },
        { season: 2022, wins: 1 },
        { season: 2023, wins: 0 },
        { season: 2024, wins: 4 },
        { season: 2025, wins: 3 },
      ],
    },
    {
      constructorId: 3,
      constructorRef: "red_bull",
      name: "Red Bull Racing",
      nationality: "Austrian",
      wins: 124,
      championships: 6,
      podiums: 280,
      firstSeason: 2005,
      recentTrend: [
        { season: 2021, wins: 11 },
        { season: 2022, wins: 17 },
        { season: 2023, wins: 21 },
        { season: 2024, wins: 9 },
        { season: 2025, wins: 8 },
      ],
    },
    {
      constructorId: 4,
      constructorRef: "mclaren",
      name: "McLaren",
      nationality: "British",
      wins: 195,
      championships: 9,
      podiums: 520,
      firstSeason: 1966,
      recentTrend: [
        { season: 2021, wins: 1 },
        { season: 2022, wins: 0 },
        { season: 2023, wins: 1 },
        { season: 2024, wins: 6 },
        { season: 2025, wins: 12 },
      ],
    },
  ];
}
