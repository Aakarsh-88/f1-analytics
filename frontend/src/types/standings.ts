export interface DriverStandingRow {
  position: number;
  driverName: string;
  driverCode: string;
  constructorName: string;
  constructorRef: string;
  points: number;
  wins: number;
}

export interface ConstructorStandingRow {
  position: number;
  constructorName: string;
  constructorRef: string;
  points: number;
  wins: number;
}

export interface ChampionshipProgressionPoint {
  round: number;
  raceName: string;
  [driverCode: string]: string | number; // dynamic keys, one per driver's cumulative points
}

export interface ConstructorChampionshipProgressionPoint {
  round: number;
  raceName: string;
  [constructorRef: string]: string | number;
}

export interface StandingsData {
  season: number;
  driverStandings: DriverStandingRow[];
  constructorStandings: ConstructorStandingRow[];
  progression: ChampionshipProgressionPoint[];
  /** Driver codes included in the progression chart, in final standings order. */
  progressionDriverCodes: string[];
  constructorProgression: ConstructorChampionshipProgressionPoint[];
  /** Constructor refs included in the progression chart, in final standings order. */
  progressionConstructorRefs: string[];
}
