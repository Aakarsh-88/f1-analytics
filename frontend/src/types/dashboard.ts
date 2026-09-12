/** Mirrors the response shape returned by the backend Dashboard API. */
export interface DashboardStats {
  totalRaces: number;
  totalDrivers: number;
  totalConstructors: number;
  totalSeasons: number;
  winsBySeasonChart: { season: number; wins: number }[];
  latestRacePodium: {
    position: 1 | 2 | 3;
    driverName: string;
    constructorName: string;
    constructorRef: string;
    points: number;
  }[];
}
