import "server-only";

import type { AnalyticsData } from "@/types/analytics";

const API_BASE_URL = process.env.API_BASE_URL;

function apiUrl(path: string): string {
  return `${API_BASE_URL?.replace(/\/$/, "") ?? ""}/api/v1${path}`;
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const response = await fetch(apiUrl("/analytics"), {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Failed to load analytics (${response.status})`);
  }

  return response.json();
}
