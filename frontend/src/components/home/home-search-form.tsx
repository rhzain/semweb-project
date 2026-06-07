import type { FormEvent } from "react";
import { ArrowRight, Search } from "lucide-react";

import {
  FilterSelect,
  type FilterOption,
} from "@/components/shared/filter-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export interface HomeSearchValues {
  q: string;
  kingdom: string;
  category: string;
}

interface HomeSearchFormProps {
  values: HomeSearchValues;
  categoryOptions: FilterOption[];
  onChange: (values: HomeSearchValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const kingdomOptions: FilterOption[] = [
  { label: "Plantae", value: "Plantae" },
  { label: "Animalia", value: "Animalia" },
];

export function HomeSearchForm({
  values,
  categoryOptions,
  onChange,
  onSubmit,
}: HomeSearchFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cari di knowledge graph</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <FieldGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(180px,1fr)_minmax(180px,1fr)_auto] xl:items-end">
            <Field>
              <FieldLabel htmlFor="home-query">Kata kunci</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="home-query"
                  onChange={(event) =>
                    onChange({ ...values, q: event.target.value })
                  }
                  placeholder="Contoh: kucing, Panthera, Felidae"
                  value={values.q}
                />
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <FilterSelect
              id="home-kingdom"
              label="Kingdom"
              onValueChange={(kingdom) => onChange({ ...values, kingdom })}
              options={kingdomOptions}
              value={values.kingdom}
            />
            <FilterSelect
              id="home-category"
              label="Kategori"
              onValueChange={(category) => onChange({ ...values, category })}
              options={categoryOptions}
              value={values.category}
            />
            <Button type="submit">
              Cari
              <ArrowRight data-icon="inline-end" />
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
