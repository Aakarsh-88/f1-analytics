import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { getTeamTextClass } from "@/lib/team-colors";
import { cn } from "@/lib/utils";
import type { ConstructorStandingRow } from "@/types/standings";

export function ConstructorStandingsTable({ rows }: { rows: ConstructorStandingRow[] }) {
  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeaderCell>Pos</TableHeaderCell>
          <TableHeaderCell>Constructor</TableHeaderCell>
          <TableHeaderCell>Wins</TableHeaderCell>
          <TableHeaderCell>Points</TableHeaderCell>
        </tr>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.constructorRef}>
            <TableCell className="font-mono font-semibold">{row.position}</TableCell>
            <TableCell className={cn("font-medium", getTeamTextClass(row.constructorRef))}>
              {row.constructorName}
            </TableCell>
            <TableCell className="font-mono tabular-nums">{row.wins}</TableCell>
            <TableCell className="font-mono text-base font-semibold tabular-nums">
              {row.points}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
