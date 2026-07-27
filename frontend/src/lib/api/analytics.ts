import "server-only";

import type { AnalyticsData } from "@/types/analytics";

const SEASONS = [2021, 2022, 2023, 2024, 2025];

/**
 * TEMPORARY MOCK — replace with a fetch to `${API_BASE_URL}/api/v1/analytics`
 * once `backend/app/services/analytics_service.py` (Milestone 2's stubbed-out
 * dashboard router) computes these aggregations server-side from `results`,
 * `qualifying`, and `driver_standings`. The shapes here are exactly what
 * that endpoint should return.
 */
export async function getAnalyticsData(): Promise<AnalyticsData> {
  return {
    seasonRange: { min: SEASONS[0]!, max: SEASONS[SEASONS.length - 1]! },

    constructorDominance: {
      constructors: [
        { ref: "red_bull", name: "Red Bull Racing" },
        { ref: "ferrari", name: "Ferrari" },
        { ref: "mclaren", name: "McLaren" },
        { ref: "mercedes", name: "Mercedes" },
      ],
      points: [
        { season: 2021, red_bull: 585, ferrari: 323, mclaren: 275, mercedes: 613 },
        { season: 2022, red_bull: 759, ferrari: 554, mclaren: 159, mercedes: 515 },
        { season: 2023, red_bull: 860, ferrari: 406, mclaren: 302, mercedes: 409 },
        { season: 2024, red_bull: 589, ferrari: 652, mclaren: 666, mercedes: 468 },
        { season: 2025, red_bull: 512, ferrari: 470, mclaren: 705, mercedes: 490 },
      ],
    },

    poleLeaderboard: [
      { driverCode: "VER", driverName: "Max Verstappen", poles: 42 },
      { driverCode: "HAM", driverName: "Lewis Hamilton", poles: 104 },
      { driverCode: "LEC", driverName: "Charles Leclerc", poles: 26 },
      { driverCode: "NOR", driverName: "Lando Norris", poles: 12 },
      { driverCode: "RUS", driverName: "George Russell", poles: 8 },
      { driverCode: "SAI", driverName: "Carlos Sainz", poles: 6 },
    ],

    fastestLapLeaderboard: [
      { driverCode: "HAM", driverName: "Lewis Hamilton", fastestLaps: 68 },
      { driverCode: "VER", driverName: "Max Verstappen", fastestLaps: 31 },
      { driverCode: "LEC", driverName: "Charles Leclerc", fastestLaps: 14 },
      { driverCode: "NOR", driverName: "Lando Norris", fastestLaps: 11 },
      { driverCode: "RUS", driverName: "George Russell", fastestLaps: 7 },
      { driverCode: "SAI", driverName: "Carlos Sainz", fastestLaps: 5 },
    ],

    // Average qualifying POSITION per season — lower is better. Charted
    // with a reversed Y axis so "improving" reads as an upward line,
    // matching how a fan would intuitively read a qualifying trend.
    avgQualifying: {
      driverCodes: ["VER", "NOR", "LEC"],
      points: [
        { season: 2021, VER: 2.1, NOR: 6.4, LEC: 5.8 },
        { season: 2022, VER: 1.8, NOR: 7.1, LEC: 2.9 },
        { season: 2023, VER: 1.5, NOR: 5.2, LEC: 4.1 },
        { season: 2024, VER: 3.2, NOR: 3.4, LEC: 3.6 },
        { season: 2025, VER: 4.0, NOR: 2.2, LEC: 3.9 },
      ],
    },

    podiumTrends: {
      driverCodes: ["VER", "NOR", "LEC"],
      points: [
        { season: 2021, VER: 18, NOR: 6, LEC: 8 },
        { season: 2022, VER: 17, NOR: 2, LEC: 11 },
        { season: 2023, VER: 21, NOR: 7, LEC: 5 },
        { season: 2024, VER: 14, NOR: 12, LEC: 9 },
        { season: 2025, VER: 10, NOR: 15, LEC: 7 },
      ],
    },
  };
}
