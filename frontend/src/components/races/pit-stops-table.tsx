import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import type { PitStopRow } from "@/types/race";

export function PitStopsTable({ pitStops }: { pitStops: PitStopRow[] }) {
  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeaderCell>Driver</TableHeaderCell>
          <TableHeaderCell>Stop</TableHeaderCell>
          <TableHeaderCell>Lap</TableHeaderCell>
          <TableHeaderCell>Time</TableHeaderCell>
          <TableHeaderCell>Duration</TableHeaderCell>
        </tr>
      </TableHead>
      <TableBody>
        {pitStops.map((p) => (
          <TableRow key={`${p.driverName}-${p.stop}`}>
            <TableCell className="font-medium">{p.driverName}</TableCell>
            <TableCell className="font-mono">{p.stop}</TableCell>
            <TableCell className="font-mono">{p.lap}</TableCell>
            <TableCell className="font-mono tabular-nums">{p.time ?? "—"}</TableCell>
            <TableCell className="font-mono tabular-nums text-sector-green">
              {p.duration ? `${p.duration}s` : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
