import "server-only";

import type { StandingsData } from "@/types/standings";

const API_BASE_URL = process.env.API_BASE_URL;

function apiUrl(path: string): string {
  return `${API_BASE_URL?.replace(/\/$/, "") ?? ""}/api/v1${path}`;
}

export async function getStandings(season?: number): Promise<StandingsData> {
  const query = season === undefined ? "" : `?season=${encodeURIComponent(season)}`;
  const response = await fetch(`${apiUrl("/standings")}${query}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load standings${season === undefined ? "" : ` for ${season}`} (${response.status})`
    );
  }

  return response.json();
}
