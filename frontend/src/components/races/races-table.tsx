"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Pagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import type { RaceSummary } from "@/types/race";

const PAGE_SIZE = 10;

export function RacesTable({ races }: { races: RaceSummary[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return races;
    return races.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.circuitName.toLowerCase().includes(q) ||
        r.country?.toLowerCase().includes(q)
    );
  }, [races, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-secondary))]"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by race, circuit, or country…"
          className="w-full rounded-md border border-line bg-[rgb(var(--surface-elevated))] py-2 pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-f1-red"
        />
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Round</TableHeaderCell>
            <TableHeaderCell>Race</TableHeaderCell>
            <TableHeaderCell>Circuit</TableHeaderCell>
            <TableHeaderCell>Date</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {pageItems.length === 0 ? (
            <tr>
              <TableCell colSpan={4} className="py-8 text-center text-[rgb(var(--text-secondary))]">
                No races match &ldquo;{query}&rdquo;.
              </TableCell>
            </tr>
          ) : (
            pageItems.map((race) => (
              <TableRow key={race.raceId}>
                <TableCell className="font-mono">{race.round}</TableCell>
                <TableCell>
                  <Link href={`/races/${race.raceId}`} className="font-medium hover:text-f1-red">
                    {race.name}
                  </Link>
                </TableCell>
                <TableCell className="text-[rgb(var(--text-secondary))]">
                  {race.circuitName}
                  {race.country && ` · ${race.country}`}
                </TableCell>
                <TableCell className="font-mono text-[rgb(var(--text-secondary))]">
                  {race.date}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
