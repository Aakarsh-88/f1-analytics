import "server-only";

import type { DriverSummary } from "@/types/driver";

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
