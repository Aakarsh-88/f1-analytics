/**
 * Mirrors the response shape the backend's `/api/v1/dashboard` endpoint
 * will return once it's built (see backend/app/api/v1/router.py, which
 * has this route commented out pending Milestone 7's analytics_service).
 * Keeping this type here now means the frontend and backend contracts
 * are defined together — swapping the mock data source in
 * `lib/api/dashboard.ts` for a real fetch won't require touching any
 * component that consumes this type.
 */
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
