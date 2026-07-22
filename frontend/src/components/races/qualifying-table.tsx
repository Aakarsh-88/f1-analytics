import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { getTeamTextClass } from "@/lib/team-colors";
import { cn } from "@/lib/utils";
import type { QualifyingRow } from "@/types/race";

export function QualifyingTable({ sessions }: { sessions: QualifyingRow[] }) {
  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeaderCell>Pos</TableHeaderCell>
          <TableHeaderCell>Driver</TableHeaderCell>
          <TableHeaderCell>Constructor</TableHeaderCell>
          <TableHeaderCell>Q1</TableHeaderCell>
          <TableHeaderCell>Q2</TableHeaderCell>
          <TableHeaderCell>Q3</TableHeaderCell>
        </tr>
      </TableHead>
      <TableBody>
        {sessions.map((q) => (
          <TableRow key={`${q.driverName}-${q.position}`}>
            <TableCell className="font-mono font-semibold">{q.position ?? "—"}</TableCell>
            <TableCell className="font-medium">{q.driverName}</TableCell>
            <TableCell className={cn("font-medium", getTeamTextClass(q.constructorRef))}>
              {q.constructorName}
            </TableCell>
            <TableCell className="font-mono tabular-nums">{q.q1 ?? "—"}</TableCell>
            <TableCell className="font-mono tabular-nums">{q.q2 ?? "—"}</TableCell>
            <TableCell className="font-mono tabular-nums text-sector-purple">{q.q3 ?? "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
