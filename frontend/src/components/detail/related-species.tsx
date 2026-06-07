import { ArrowRight, Leaf, PawPrint } from "lucide-react";
import { Link } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SpeciesListItem } from "@/types/api";

interface RelatedSpeciesProps {
  items: SpeciesListItem[];
}

export function RelatedSpecies({ items }: RelatedSpeciesProps) {
  if (!items.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Spesies Terkait</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {items.map((item) => {
          const TypeIcon = item.kingdomLabel === "Plantae" ? Leaf : PawPrint;

          return (
            <Link
              className="group grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
              key={item.id}
              to={`/species/${item.id}`}
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
                <TypeIcon />
              </span>
              <span className="min-w-0">
                <strong className="block truncate text-sm font-medium">
                  {item.indonesianName}
                </strong>
                <small className="block truncate text-xs italic text-muted-foreground">
                  {item.scientificName}
                </small>
              </span>
              <ArrowRight className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
