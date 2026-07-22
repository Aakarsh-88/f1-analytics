import "server-only";

import type { RaceDetail, RaceSummary } from "@/types/race";

/**
 * TEMPORARY MOCK — replace with a fetch to `${API_BASE_URL}/api/v1/races`
 * once `backend/app/api/v1/races.py` exists (paginated, filterable by
 * year/circuit per the original spec).
 */
export async function getRaces(): Promise<RaceSummary[]> {
  return [
    {
      raceId: 1,
      year: 2025,
      round: 1,
      name: "Bahrain Grand Prix",
      circuitName: "Bahrain International Circuit",
      country: "Bahrain",
      date: "2025-03-02",
    },
    {
      raceId: 2,
      year: 2025,
      round: 2,
      name: "Saudi Arabian Grand Prix",
      circuitName: "Jeddah Corniche Circuit",
      country: "Saudi Arabia",
      date: "2025-03-09",
    },
    {
      raceId: 3,
      year: 2025,
      round: 3,
      name: "British Grand Prix",
      circuitName: "Silverstone Circuit",
      country: "UK",
      date: "2025-07-06",
    },
    {
      raceId: 4,
      year: 2025,
      round: 4,
      name: "Italian Grand Prix",
      circuitName: "Monza Circuit",
      country: "Italy",
      date: "2025-09-07",
    },
  ];
}

/**
 * TEMPORARY MOCK — replace with a fetch to
 * `${API_BASE_URL}/api/v1/races/{raceId}` (aggregating results, qualifying,
 * pit stops, and lap times server-side) once that endpoint exists.
 */
export async function getRaceDetail(raceId: number): Promise<RaceDetail | null> {
  const races = await getRaces();
  const race = races.find((r) => r.raceId === raceId);
  if (!race) return null;

  return {
    race,
    results: [
      {
        position: 1,
        positionText: "1",
        driverName: "Max Verstappen",
        constructorName: "Red Bull Racing",
        constructorRef: "red_bull",
        grid: 1,
        points: 25,
        laps: 57,
        status: "Finished",
        fastestLapTime: "1:32.608",
      },
      {
        position: 2,
        positionText: "2",
        driverName: "Lando Norris",
        constructorName: "McLaren",
        constructorRef: "mclaren",
        grid: 3,
        points: 18,
        laps: 57,
        status: "Finished",
        fastestLapTime: "1:33.012",
      },
      {
        position: 3,
        positionText: "3",
        driverName: "Charles Leclerc",
        constructorName: "Ferrari",
        constructorRef: "ferrari",
        grid: 2,
        points: 15,
        laps: 57,
        status: "Finished",
        fastestLapTime: "1:33.204",
      },
      {
        position: null,
        positionText: "DNF",
        driverName: "George Russell",
        constructorName: "Mercedes",
        constructorRef: "mercedes",
        grid: 5,
        points: 0,
        laps: 41,
        status: "Engine",
        fastestLapTime: null,
      },
    ],
    qualifying: [
      {
        position: 1,
        driverName: "Max Verstappen",
        constructorName: "Red Bull Racing",
        constructorRef: "red_bull",
        q1: "1:31.402",
        q2: "1:30.988",
        q3: "1:30.311",
      },
      {
        position: 2,
        driverName: "Charles Leclerc",
        constructorName: "Ferrari",
        constructorRef: "ferrari",
        q1: "1:31.550",
        q2: "1:31.021",
        q3: "1:30.512",
      },
      {
        position: 3,
        driverName: "Lando Norris",
        constructorName: "McLaren",
        constructorRef: "mclaren",
        q1: "1:31.601",
        q2: "1:31.104",
        q3: "1:30.644",
      },
    ],
    pitStops: [
      { driverName: "Max Verstappen", stop: 1, lap: 18, time: "14:32:01", duration: "2.31" },
      { driverName: "Lando Norris", stop: 1, lap: 20, time: "14:34:12", duration: "2.45" },
      { driverName: "Charles Leclerc", stop: 1, lap: 19, time: "14:33:20", duration: "2.28" },
    ],
    lapTimes: buildMockLapTimes(),
  };
}

/** Generates a plausible lap-by-lap trace for 3 drivers over 20 laps, for the chart demo. */
function buildMockLapTimes() {
  const drivers = [
    { code: "VER", base: 93.5 },
    { code: "NOR", base: 93.9 },
    { code: "LEC", base: 94.1 },
  ];
  const points = [];
  for (let lap = 1; lap <= 20; lap++) {
    for (const driver of drivers) {
      const variance = Math.sin(lap / 3) * 0.4 + (Math.random() - 0.5) * 0.3;
      points.push({ lap, driverCode: driver.code, seconds: Number((driver.base + variance).toFixed(3)) });
    }
  }
  return points;
}
