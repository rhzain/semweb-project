import type { FormEvent } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export interface HomeSearchValues {
  q: string;
}

interface HomeSearchFormProps {
  values: HomeSearchValues;
  categories: string[];
  onChange: (values: HomeSearchValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function HomeSearchForm({
  values,
  categories,
  onChange,
  onSubmit,
}: HomeSearchFormProps) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <form onSubmit={onSubmit}>
        <FieldGroup>
          <Field>
            <InputGroup className="h-12 rounded-sm bg-background shadow-[0_12px_36px_rgba(20,52,37,0.07)]">
              <InputGroupAddon className="pl-4">
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                className="pr-4 text-sm sm:text-base"
                id="home-query"
                onChange={(event) => onChange({ q: event.target.value })}
                placeholder="Cari nama spesies, nama ilmiah, family, atau genus"
                value={values.q}
              />
            </InputGroup>
          </Field>
        </FieldGroup>
      </form>

      {categories.length ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Kategori cepat
          </span>
          {categories.slice(0, 4).map((category) => (
            <Button asChild key={category} size="sm" variant="outline">
              <Link to={`/data?category=${encodeURIComponent(category)}`}>
                {category}
              </Link>
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
