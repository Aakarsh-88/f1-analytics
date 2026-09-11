import "server-only";

import { getRaces } from "@/lib/api/races";

export async function getDataSeasonRange(): Promise<{ min: number; max: number }> {
  const races = await getRaces();
  const years = races.map((race) => race.year);

  return {
    min: Math.min(...years),
    max: Math.max(...years),
  };
}
