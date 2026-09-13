import "server-only";

import type { RaceDetail, RaceSummary } from "@/types/race";

const API_BASE_URL = process.env.API_BASE_URL;

function apiUrl(path: string): string {
  return `${API_BASE_URL?.replace(/\/$/, "") ?? ""}/api/v1${path}`;
}

export async function getRaces(season?: number): Promise<RaceSummary[]> {
  const query = season === undefined ? "" : `?season=${encodeURIComponent(season)}`;
  const response = await fetch(`${apiUrl("/races")}${query}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Failed to load races${season === undefined ? "" : ` for ${season}`} (${response.status})`);
  }

  return response.json();
}

export async function getRaceDetail(raceId: number): Promise<RaceDetail | null> {
  const response = await fetch(apiUrl(`/races/${raceId}`), {
    next: { revalidate: 300 },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load race ${raceId} (${response.status})`);
  }

  return response.json();
}
