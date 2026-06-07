import { SearchX } from "lucide-react";

import { SpeciesCard } from "@/components/shared/species-card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import type { SpeciesListItem } from "@/types/api";

interface SpeciesGridProps {
  items: SpeciesListItem[];
  className?: string;
}

export function SpeciesGrid({ items, className }: SpeciesGridProps) {
  if (!items.length) {
    return (
      <Empty className="border bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX />
          </EmptyMedia>
          <EmptyTitle>Belum ada data yang cocok</EmptyTitle>
          <EmptyDescription>
            Ubah kata kunci atau filter untuk melihat hasil lainnya.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <section className={cn("grid gap-5 md:grid-cols-2 xl:grid-cols-3", className)}>
      {items.map((item) => (
        <SpeciesCard item={item} key={item.id} />
      ))}
    </section>
  );
}
