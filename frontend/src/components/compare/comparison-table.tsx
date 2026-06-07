import { cn } from "@/lib/utils";
import type { ComparisonRow, SpeciesDetail } from "@/types/api";

interface ComparisonTableProps {
  rows: ComparisonRow[];
  speciesA: SpeciesDetail | null;
  speciesB: SpeciesDetail | null;
}

function valueClassName(same: boolean) {
  return cn(
    "rounded-sm border px-4 py-3 text-sm font-medium",
    same
      ? "border-primary/20 bg-primary/5 text-primary"
      : "border-destructive/20 bg-destructive/10 text-destructive",
  );
}

function displayLevel(level: string) {
  if (level === "Kelas") return "Kelas";
  return level;
}

export function ComparisonTable({
  rows,
  speciesA,
  speciesB,
}: ComparisonTableProps) {
  const comparisonRows =
    speciesA && speciesB
      ? [
          ...rows,
          {
            level: "Spesies",
            labelA: speciesA.scientificName,
            labelB: speciesB.scientificName,
            same: speciesA.id === speciesB.id,
          },
        ]
      : rows;

  return (
    <section className="w-full text-card-foreground">
      <div className="flex w-full flex-col gap-6">
        <h2 className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Keselarasan Taksonomi
        </h2>

        {comparisonRows.length ? (
          <div className="flex w-full flex-col gap-3">
            {comparisonRows.map((row) => (
              <div
                className="grid w-full gap-2 md:grid-cols-[minmax(0,1fr)_7.5rem_minmax(0,1fr)] md:items-center"
                key={row.level}
              >
                <div className={cn(valueClassName(row.same), "md:text-right")}>
                  {row.labelA}
                </div>
                <div className="order-first text-center text-[0.7rem] font-bold uppercase tracking-[0.16em] text-muted-foreground md:order-none">
                  {displayLevel(row.level)}
                </div>
                <div className={valueClassName(row.same)}>{row.labelB}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Belum ada data perbandingan.
          </p>
        )}
      </div>
    </section>
  );
}
