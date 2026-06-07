import { RotateCcw } from "lucide-react";

import { SpeciesSelect } from "@/components/shared/species-select";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { SpeciesOption } from "@/types/api";

interface GraphToolbarProps {
  speciesId: string;
  options: SpeciesOption[];
  onChange: (value: string) => void;
}

const legendItems = [
  { label: "Spesies", className: "bg-destructive" },
  { label: "Takson", className: "bg-muted-foreground" },
  { label: "Kategori", className: "bg-chart-3" },
];

export function GraphToolbar({
  speciesId,
  options,
  onChange,
}: GraphToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <FieldGroup className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <SpeciesSelect
            appearance="search"
            hideLabel
            id="graph-species"
            label="Fokus spesies"
            onValueChange={onChange}
            options={options}
            value={speciesId}
          />
          {speciesId ? (
            <Button
              className="h-10 rounded-sm"
              onClick={() => onChange("")}
              type="button"
              variant="outline"
            >
              <RotateCcw data-icon="inline-start" />
              Semua graph
            </Button>
          ) : null}
        </div>

        <div className="flex min-h-10 flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {legendItems.map((item) => (
            <span className="inline-flex items-center gap-2" key={item.label}>
              <span className={cn("size-2.5 rounded-full", item.className)} />
              {item.label}
            </span>
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}
