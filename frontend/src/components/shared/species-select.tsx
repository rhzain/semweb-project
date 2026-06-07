import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import type { SpeciesOption } from "@/types/api";

interface SpeciesSelectProps {
  id: string;
  label: string;
  value: string;
  options: SpeciesOption[];
  allowAll?: boolean;
  onValueChange: (value: string) => void;
}

const ALL_SPECIES = "__all_species__";

export function SpeciesSelect({
  id,
  label,
  value,
  options,
  allowAll = false,
  onValueChange,
}: SpeciesSelectProps) {
  const selectValue = allowAll && !value ? ALL_SPECIES : value;

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        onValueChange={(nextValue) =>
          onValueChange(nextValue === ALL_SPECIES ? "" : nextValue)
        }
        value={selectValue}
      >
        <SelectTrigger className="w-full" id={id}>
          <SelectValue placeholder="Pilih spesies" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectGroup>
            {allowAll ? (
              <SelectItem value={ALL_SPECIES}>Semua data</SelectItem>
            ) : null}
            {options.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.indonesianName} - {item.scientificName}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
