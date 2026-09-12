import "server-only";

import type { DashboardStats } from "@/types/dashboard";

const API_BASE_URL = process.env.API_BASE_URL;

function apiUrl(path: string): string {
  return `${API_BASE_URL?.replace(/\/$/, "") ?? ""}/api/v1${path}`;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(apiUrl("/dashboard"), {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Failed to load dashboard (${response.status})`);
  }

  return response.json();
}
