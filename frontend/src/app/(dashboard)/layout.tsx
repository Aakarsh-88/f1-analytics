import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { getDataSeasonRange } from "@/lib/api/data-range";
import { getSearchIndex } from "@/lib/api/search";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const [searchIndex, seasonRange] = await Promise.all([
    getSearchIndex(),
    getDataSeasonRange(),
  ]);

  return (
    <div className="flex min-h-screen bg-[rgb(var(--surface-bg))]">
      <Sidebar seasonRange={seasonRange} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav searchIndex={searchIndex} />
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
