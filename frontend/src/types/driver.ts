export interface DriverSummary {
  driverId: number;
  driverRef: string;
  fullName: string;
  code: string | null;
  number: number | null;
  nationality: string | null;
  wins: number;
  podiums: number;
  championships: number;
  winPercentage: number;
}
