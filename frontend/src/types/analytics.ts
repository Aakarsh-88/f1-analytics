export interface SeasonRange {
  min: number;
  max: number;
}

/** One row per season, one numeric field per constructor's points that season. */
export interface ConstructorDominancePoint {
  season: number;
  [constructorRef: string]: number | string;
}

export interface ConstructorMeta {
  ref: string;
  name: string;
}

export interface PoleLeaderboardRow {
  driverCode: string;
  driverName: string;
  poles: number;
}

export interface FastestLapLeaderboardRow {
  driverCode: string;
  driverName: string;
  fastestLaps: number;
}

/** One row per season, one numeric field per driver's average qualifying position that season. */
export interface AvgQualifyingPoint {
  season: number;
  [driverCode: string]: number | string;
}

/** One row per season, one numeric field per driver's podium count that season. */
export interface PodiumTrendPoint {
  season: number;
  [driverCode: string]: number | string;
}

export interface DriverTeamConstructor {
  ref: string;
  name: string;
  color: string;
}

export interface DriverTeamPoint {
  season: number;
  driverCode: string;
  constructors: DriverTeamConstructor[];
}

export interface AnalyticsData {
  seasonRange: SeasonRange;
  constructorDominance: {
    points: ConstructorDominancePoint[];
    constructors: ConstructorMeta[];
  };
  poleLeaderboard: PoleLeaderboardRow[];
  fastestLapLeaderboard: FastestLapLeaderboardRow[];
  avgQualifying: {
    points: AvgQualifyingPoint[];
    driverCodes: string[];
  };
  podiumTrends: {
    points: PodiumTrendPoint[];
    driverCodes: string[];
  };
  driverTeams: DriverTeamPoint[];
}
