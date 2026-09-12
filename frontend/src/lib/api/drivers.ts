import "server-only";

import type { DriverDetail, DriverSummary } from "@/types/driver";

const API_BASE_URL = process.env.API_BASE_URL;
const PAGE_SIZE = 100;

function apiUrl(path: string): string {
  return `${API_BASE_URL?.replace(/\/$/, "") ?? ""}/api/v1${path}`;
}

interface PaginatedDrivers {
  items: DriverSummary[];
  total_pages: number;
}

export async function getDrivers(): Promise<DriverSummary[]> {
  const firstPageResponse = await fetch(
    `${apiUrl("/drivers")}?page=1&page_size=${PAGE_SIZE}`,
    { next: { revalidate: 300 } }
  );

  if (!firstPageResponse.ok) {
    throw new Error(`Failed to load drivers (${firstPageResponse.status})`);
  }

  const firstPage = (await firstPageResponse.json()) as PaginatedDrivers;
  if (firstPage.total_pages <= 1) {
    return firstPage.items;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.total_pages - 1 }, (_, index) =>
      fetch(`${apiUrl("/drivers")}?page=${index + 2}&page_size=${PAGE_SIZE}`, {
        next: { revalidate: 300 },
      })
    )
  );

  const remainingData = await Promise.all(
    remainingPages.map(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load drivers (${response.status})`);
      }
      return (await response.json()) as PaginatedDrivers;
    })
  );

  return [firstPage, ...remainingData].flatMap((page) => page.items);
}

export async function getDriverDetail(driverRef: string): Promise<DriverDetail | null> {
  const response = await fetch(apiUrl(`/drivers/${encodeURIComponent(driverRef)}`), {
    next: { revalidate: 300 },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load driver ${driverRef} (${response.status})`);
  }

  return response.json();
}
