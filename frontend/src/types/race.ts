export interface RaceSummary {
  raceId: number;
  year: number;
  round: number;
  name: string;
  circuitName: string;
  country: string | null;
  date: string; // ISO date
  winnerDriverName?: string | null;
  winnerConstructorName?: string | null;
  winnerConstructorRef?: string | null;
  winnerConstructorAbbreviation?: string | null;
}

export interface RaceResultRow {
  position: number | null;
  positionText: string;
  driverName: string;
  constructorName: string;
  constructorRef: string;
  grid: number;
  points: number;
  laps: number;
  status: string;
  fastestLapTime: string | null;
}

export interface QualifyingRow {
  position: number | null;
  driverName: string;
  constructorName: string;
  constructorRef: string;
  q1: string | null;
  q2: string | null;
  q3: string | null;
}

export interface PitStopRow {
  driverName: string;
  stop: number;
  lap: number;
  time: string | null;
  duration: string | null;
}

export interface LapTimePoint {
  lap: number;
  driverCode: string;
  /** Lap time converted to seconds for charting (e.g. "1:23.456" -> 83.456). */
  seconds: number;
}

export interface RaceDetail {
  race: RaceSummary;
  results: RaceResultRow[];
  qualifying: QualifyingRow[];
  pitStops: PitStopRow[];
  lapTimes: LapTimePoint[];
}
