import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ComparisonRow, SpeciesDetail } from "@/types/api";

interface ComparisonTableProps {
  rows: ComparisonRow[];
  speciesA: SpeciesDetail | null;
  speciesB: SpeciesDetail | null;
}

export function ComparisonTable({
  rows,
  speciesA,
  speciesB,
}: ComparisonTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Perbandingan tingkat taksonomi</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-(--card-spacing)">Tingkat</TableHead>
              <TableHead>{speciesA?.indonesianName || "Spesies A"}</TableHead>
              <TableHead>{speciesB?.indonesianName || "Spesies B"}</TableHead>
              <TableHead className="pr-(--card-spacing)">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.level}>
                <TableCell className="pl-(--card-spacing) font-medium">
                  {row.level}
                </TableCell>
                <TableCell>{row.labelA}</TableCell>
                <TableCell>{row.labelB}</TableCell>
                <TableCell className="pr-(--card-spacing)">
                  <Badge variant={row.same ? "default" : "secondary"}>
                    {row.same ? "Sama" : "Berbeda"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
