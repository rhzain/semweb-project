import { SpeciesSelect } from "@/components/shared/species-select";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import type { SpeciesOption } from "@/types/api";

interface CompareControlsProps {
  speciesA: string;
  speciesB: string;
  options: SpeciesOption[];
  onChange: (key: "species_a" | "species_b", value: string) => void;
}

export function CompareControls({
  speciesA,
  speciesB,
  options,
  onChange,
}: CompareControlsProps) {
  return (
    <Card>
      <CardContent>
        <FieldGroup className="grid gap-4 md:grid-cols-2">
          <SpeciesSelect
            id="species-a"
            label="Spesies pertama"
            onValueChange={(value) => onChange("species_a", value)}
            options={options}
            value={speciesA}
          />
          <SpeciesSelect
            id="species-b"
            label="Spesies kedua"
            onValueChange={(value) => onChange("species_b", value)}
            options={options}
            value={speciesB}
          />
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
