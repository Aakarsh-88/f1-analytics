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

export interface ResultsBreakdown {
  wins: number;
  otherPodiums: number;
  pointsFinishes: number;
  noPointsFinishes: number;
  dnfs: number;
}

export interface DriverDetail {
  summary: DriverSummary;
  totalRaces: number;
  averageFinish: number;
  dnfPercentage: number;
  winsBySeasonChart: { season: number; wins: number }[];
  resultsBreakdown: ResultsBreakdown;
}

