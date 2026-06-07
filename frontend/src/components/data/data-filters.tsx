import { Search } from "lucide-react";

import {
  FilterSelect,
  type FilterOption,
} from "@/components/shared/filter-select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
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
    <Card className="lg:sticky lg:top-28">
      <CardHeader>
        <CardTitle>Filter Katalog</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldSet>
          <FieldLegend className="sr-only">Filter Katalog</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="catalog-query">Cari data</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="catalog-query"
                  onChange={(event) => onChange("q", event.target.value)}
                  placeholder="Nama, family, atau genus"
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
        </FieldSet>
      </CardContent>
    </Card>
  );
}
