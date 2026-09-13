import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { getTeamTextClass } from "@/lib/team-colors";
import { cn } from "@/lib/utils";
import type { RaceResultRow } from "@/types/race";

const MEDAL_STYLES: Record<number, string> = {
  1: "border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]",
  2: "border-[#C0C0C0] bg-[#C0C0C0]/20 text-[#C0C0C0]",
  3: "border-[#CD7F32] bg-[#CD7F32]/20 text-[#CD7F32]",
};

export function ResultsTable({ results }: { results: RaceResultRow[] }) {
  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeaderCell>Pos</TableHeaderCell>
          <TableHeaderCell>Driver</TableHeaderCell>
          <TableHeaderCell>Constructor</TableHeaderCell>
          <TableHeaderCell>Grid</TableHeaderCell>
          <TableHeaderCell>Points</TableHeaderCell>
          <TableHeaderCell>Fastest Lap</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
        </tr>
      </TableHead>
      <TableBody>
        {results.map((r) => (
          <TableRow key={`${r.driverName}-${r.positionText}`}>
            <TableCell className="font-mono font-semibold">
              {r.position && r.position >= 1 && r.position <= 3 ? (
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold",
                    MEDAL_STYLES[r.position]
                  )}
                  aria-label={`${r.position}${r.position === 1 ? "st" : r.position === 2 ? "nd" : "rd"} place`}
                >
                  {r.position}
                </span>
              ) : (
                r.positionText
              )}
            </TableCell>
            <TableCell className="font-medium">{r.driverName}</TableCell>
            <TableCell className={cn("font-medium", getTeamTextClass(r.constructorRef))}>
              {r.constructorName}
            </TableCell>
            <TableCell className="font-mono">{r.grid}</TableCell>
            <TableCell className="font-mono tabular-nums">{r.points}</TableCell>
            <TableCell className="font-mono tabular-nums">{r.fastestLapTime ?? "—"}</TableCell>
            <TableCell>
              <Badge variant={r.status === "Finished" ? "success" : "neutral"}>{r.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
