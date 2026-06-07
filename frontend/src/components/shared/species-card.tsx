import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SpeciesListItem } from "@/types/api";

interface SpeciesCardProps {
  item: SpeciesListItem;
}

export function SpeciesCard({ item }: SpeciesCardProps) {
  const metadata = [
    ["Phylum", item.phylumLabel],
    ["Family", item.familyLabel],
    ["Genus", item.genusLabel],
    ["Inggris", item.englishName],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge variant="secondary">{item.kingdomLabel}</Badge>
          <Badge variant="outline">{item.categoryLabel}</Badge>
          {item.relation ? <Badge>{item.relation}</Badge> : null}
        </div>
        <CardTitle className="text-lg">{item.indonesianName}</CardTitle>
        <CardDescription className="font-medium italic text-foreground/80">
          {item.scientificName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4">
          {metadata.map(([label, value]) => (
            <div className="min-w-0" key={label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-1 truncate text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline">
          <Link to={`/species/${item.id}`}>
            Detail
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
