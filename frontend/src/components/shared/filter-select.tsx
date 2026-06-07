import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  emptyLabel?: string;
  onValueChange: (value: string) => void;
  className?: string;
}

const EMPTY_VALUE = "__all__";

export function FilterSelect({
  id,
  label,
  value,
  options,
  emptyLabel = "Semua",
  onValueChange,
  className,
}: FilterSelectProps) {
  return (
    <Field className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        onValueChange={(nextValue) =>
          onValueChange(nextValue === EMPTY_VALUE ? "" : nextValue)
        }
        value={value || EMPTY_VALUE}
      >
        <SelectTrigger className="w-full rounded-sm" id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectGroup>
            <SelectItem value={EMPTY_VALUE}>{emptyLabel}</SelectItem>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
