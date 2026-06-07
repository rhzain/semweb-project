import { Search } from "lucide-react";

import {
  FilterSelect,
  type FilterOption,
} from "@/components/shared/filter-select";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface DataFiltersProps {
  query: string;
  kingdom: string;
  category: string;
  categoryOptions: FilterOption[];
  onChange: (key: string, value: string) => void;
}

const kingdomOptions: FilterOption[] = [
  { label: "Plantae", value: "Plantae" },
  { label: "Animalia", value: "Animalia" },
];

export function DataFilters({
  query,
  kingdom,
  category,
  categoryOptions,
  onChange,
}: DataFiltersProps) {
  return (
    <Card>
      <CardContent>
        <FieldGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(180px,1fr)_minmax(180px,1fr)]">
          <Field>
            <FieldLabel htmlFor="catalog-query">Cari data</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="catalog-query"
                onChange={(event) => onChange("q", event.target.value)}
                placeholder="Nama, phylum, family, genus, kategori"
                value={query}
              />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <FilterSelect
            id="catalog-kingdom"
            label="Kingdom"
            onValueChange={(value) => onChange("kingdom", value)}
            options={kingdomOptions}
            value={kingdom}
          />
          <FilterSelect
            id="catalog-category"
            label="Kategori"
            onValueChange={(value) => onChange("category", value)}
            options={categoryOptions}
            value={category}
          />
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
