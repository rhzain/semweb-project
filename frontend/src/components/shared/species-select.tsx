import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { SpeciesOption } from "@/types/api";

interface SpeciesSelectProps {
  id: string;
  label: string;
  value: string;
  options: SpeciesOption[];
  allowAll?: boolean;
  appearance?: "default" | "search";
  hideLabel?: boolean;
  onValueChange: (value: string) => void;
}

const ALL_SPECIES = "__all_species__";

function formatSpeciesOption(item: SpeciesOption) {
  return [item.indonesianName, item.scientificName].filter(Boolean).join(" - ");
}

function formatSearchValue(item: SpeciesOption) {
  return item.scientificName || item.indonesianName || item.id;
}

function matchesSearch(item: SpeciesOption, term: string) {
  const haystack = [
    item.indonesianName,
    item.scientificName,
    item.kingdomLabel,
    item.categoryLabel,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(term);
}

export function SpeciesSelect({
  id,
  label,
  value,
  options,
  allowAll = false,
  appearance = "default",
  hideLabel = false,
  onValueChange,
}: SpeciesSelectProps) {
  const selectValue = allowAll && !value ? ALL_SPECIES : value;
  const selectedOption = options.find((item) => item.id === value);
  const selectedLabel = selectedOption ? formatSearchValue(selectedOption) : "";
  const isSearchAppearance = appearance === "search";
  const [searchValue, setSearchValue] = useState(selectedLabel);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isSearchAppearance) {
      setSearchValue(selectedLabel);
    }
  }, [isSearchAppearance, selectedLabel]);

  const filteredOptions = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    const source = term
      ? options.filter((item) => matchesSearch(item, term))
      : options;

    return source.slice(0, 40);
  }, [options, searchValue]);

  function chooseOption(item: SpeciesOption) {
    setSearchValue(formatSearchValue(item));
    setOpen(false);
    onValueChange(item.id);
  }

  if (isSearchAppearance) {
    return (
      <Field>
        <FieldLabel className={hideLabel ? "sr-only" : undefined} htmlFor={id}>
          {label}
        </FieldLabel>
        <div
          className="relative"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setOpen(false);
            }
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-autocomplete="list"
            aria-controls={`${id}-options`}
            aria-expanded={open}
            autoComplete="off"
            className="h-10 rounded-sm bg-background pl-10 text-sm shadow-none"
            id={id}
            onChange={(event) => {
              setSearchValue(event.target.value);
              setOpen(true);
            }}
            onFocus={(event) => {
              setOpen(true);
              event.currentTarget.select();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && filteredOptions[0]) {
                event.preventDefault();
                chooseOption(filteredOptions[0]);
              }

              if (event.key === "Escape") {
                setOpen(false);
                setSearchValue(selectedLabel);
              }
            }}
            placeholder="Cari spesies"
            role="combobox"
            value={searchValue}
          />

          {open ? (
            <div
              className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-50 max-h-72 overflow-y-auto rounded-sm border bg-popover p-1 text-popover-foreground shadow-md"
              id={`${id}-options`}
              role="listbox"
            >
              {filteredOptions.length ? (
                filteredOptions.map((item) => (
                  <button
                    aria-selected={item.id === value}
                    className={cn(
                      "flex w-full flex-col rounded-sm px-3 py-2 text-left text-sm outline-none transition-colors hover:bg-muted focus:bg-muted",
                      item.id === value && "bg-muted",
                    )}
                    key={item.id}
                    onClick={() => chooseOption(item)}
                    onMouseDown={(event) => event.preventDefault()}
                    role="option"
                    type="button"
                  >
                    <span className="font-medium">{item.indonesianName}</span>
                    <span className="text-xs italic text-muted-foreground">
                      {item.scientificName}
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  Tidak ada spesies yang cocok.
                </p>
              )}
            </div>
          ) : null}
        </div>
      </Field>
    );
  }

  return (
    <Field>
      <FieldLabel className={hideLabel ? "sr-only" : undefined} htmlFor={id}>
        {label}
      </FieldLabel>
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
                {formatSpeciesOption(item)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
