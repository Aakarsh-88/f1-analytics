import "server-only";

import type { ConstructorSummary } from "@/types/constructor";

const API_BASE_URL = process.env.API_BASE_URL;
const PAGE_SIZE = 100;

function apiUrl(path: string): string {
  return `${API_BASE_URL?.replace(/\/$/, "") ?? ""}/api/v1${path}`;
}

interface PaginatedConstructors {
  items: ConstructorSummary[];
  total_pages: number;
}

export async function getConstructors(): Promise<ConstructorSummary[]> {
  const firstPageResponse = await fetch(
    `${apiUrl("/constructors")}?page=1&page_size=${PAGE_SIZE}`,
    { next: { revalidate: 300 } }
  );

  if (!firstPageResponse.ok) {
    throw new Error(`Failed to load constructors (${firstPageResponse.status})`);
  }

  const firstPage = (await firstPageResponse.json()) as PaginatedConstructors;
  if (firstPage.total_pages <= 1) {
    return firstPage.items;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.total_pages - 1 }, (_, index) =>
      fetch(`${apiUrl("/constructors")}?page=${index + 2}&page_size=${PAGE_SIZE}`, {
        next: { revalidate: 300 },
      })
    )
  );

  const remainingData = await Promise.all(
    remainingPages.map(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load constructors (${response.status})`);
      }
      return (await response.json()) as PaginatedConstructors;
    })
  );

  return [firstPage, ...remainingData].flatMap((page) => page.items);
}
