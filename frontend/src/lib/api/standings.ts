import "server-only";

import type { StandingsData } from "@/types/standings";

/**
 * TEMPORARY MOCK — replace with a fetch to `${API_BASE_URL}/api/v1/standings`
 * once `backend/app/api/v1/standings.py` exists.
 */
export async function getStandings(): Promise<StandingsData> {
  const progressionDriverCodes = ["VER", "NOR", "LEC"];

  const progression = [
    { round: 1, raceName: "Bahrain", VER: 25, NOR: 18, LEC: 15 },
    { round: 2, raceName: "Saudi Arabia", VER: 44, NOR: 34, LEC: 33 },
    { round: 3, raceName: "Australia", VER: 69, NOR: 42, LEC: 51 },
    { round: 4, raceName: "Japan", VER: 87, NOR: 60, LEC: 61 },
    { round: 5, raceName: "China", VER: 100, NOR: 78, LEC: 76 },
  ];

  return {
    season: 2025,
    driverStandings: [
      {
        position: 1,
        driverName: "Max Verstappen",
        driverCode: "VER",
        constructorName: "Red Bull Racing",
        constructorRef: "red_bull",
        points: 100,
        wins: 4,
      },
      {
        position: 2,
        driverName: "Lando Norris",
        driverCode: "NOR",
        constructorName: "McLaren",
        constructorRef: "mclaren",
        points: 78,
        wins: 0,
      },
      {
        position: 3,
        driverName: "Charles Leclerc",
        driverCode: "LEC",
        constructorName: "Ferrari",
        constructorRef: "ferrari",
        points: 76,
        wins: 1,
      },
    ],
    constructorStandings: [
      { position: 1, constructorName: "Red Bull Racing", constructorRef: "red_bull", points: 165, wins: 4 },
      { position: 2, constructorName: "McLaren", constructorRef: "mclaren", points: 130, wins: 0 },
      { position: 3, constructorName: "Ferrari", constructorRef: "ferrari", points: 128, wins: 1 },
    ],
    progression,
    progressionDriverCodes,
  };
}
