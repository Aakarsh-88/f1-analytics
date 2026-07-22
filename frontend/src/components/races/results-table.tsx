import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { getTeamTextClass } from "@/lib/team-colors";
import { cn } from "@/lib/utils";
import type { RaceResultRow } from "@/types/race";

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
            <TableCell className="font-mono font-semibold">{r.positionText}</TableCell>
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
