import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { SpeciesImage } from "@/components/shared/species-image";
import { Badge } from "@/components/ui/badge";
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
  return (
    <Link className="group block h-full" to={`/species/${item.id}`}>
      <Card className="h-full gap-0 py-0 transition-[box-shadow,border-color] duration-200 group-hover:border-primary/25 group-hover:shadow-[0_18px_50px_rgba(23,60,42,0.09)]">
        <SpeciesImage
          className="aspect-[4/3] w-full"
          imageSource={item.imageSource}
          imageUrl={item.imageUrl}
          kingdom={item.kingdomLabel}
          scientificName={item.scientificName}
        />
        <CardHeader className="gap-3 pt-5">
          <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{item.categoryLabel}</Badge>
              {item.relation ? (
                <Badge variant="outline">{item.relation}</Badge>
              ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg font-semibold tracking-[-0.02em]">
              {item.indonesianName}
            </CardTitle>
            <CardDescription className="font-medium italic">
              {item.scientificName}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-5">
          {item.description ? (
            <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              Family {item.familyLabel}, genus {item.genusLabel}.
            </p>
          )}
        </CardContent>
        <CardFooter className="mt-auto justify-between border-none bg-transparent py-4 text-sm font-medium text-primary">
          <span className="text-xs font-medium text-muted-foreground">{item.kingdomLabel}</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary/80">
            Lihat detail
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
