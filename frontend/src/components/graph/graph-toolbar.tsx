import { SpeciesSelect } from "@/components/shared/species-select";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { SpeciesOption } from "@/types/api";

interface GraphToolbarProps {
  speciesId: string;
  options: SpeciesOption[];
  onChange: (value: string) => void;
}

const legendItems = [
  { label: "Species", className: "bg-primary" },
  { label: "Taxon", className: "bg-muted-foreground" },
  { label: "Category", className: "bg-chart-3" },
];

export function GraphToolbar({
  speciesId,
  options,
  onChange,
}: GraphToolbarProps) {
  return (
    <Card>
      <CardContent>
        <FieldGroup className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <SpeciesSelect
            allowAll
            id="graph-species"
            label="Fokus spesies"
            onValueChange={onChange}
            options={options}
            value={speciesId}
          />
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {legendItems.map((item) => (
              <span className="inline-flex items-center gap-2" key={item.label}>
                <span className={cn("size-2.5 rounded-full", item.className)} />
                {item.label}
              </span>
            ))}
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
