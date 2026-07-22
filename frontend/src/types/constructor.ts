export interface ConstructorSummary {
  constructorId: number;
  constructorRef: string;
  name: string;
  nationality: string | null;
  wins: number;
  championships: number;
  podiums: number;
  firstSeason: number;
  /** Wins per season for the last N seasons — powers the trend sparkline on the constructor card. */
  recentTrend: { season: number; wins: number }[];
}
