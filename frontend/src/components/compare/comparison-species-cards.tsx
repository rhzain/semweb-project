import { SpeciesImage } from "@/components/shared/species-image";
import { Badge } from "@/components/ui/badge";
import type { SpeciesDetail } from "@/types/api";

interface ComparisonSpeciesCardsProps {
  speciesA: SpeciesDetail;
  speciesB: SpeciesDetail;
}

function SpeciesPreview({ item }: { item: SpeciesDetail }) {
  return (
    <article className="overflow-hidden rounded-sm border bg-card text-card-foreground">
      <SpeciesImage
        className="aspect-[16/10] min-h-44 w-full"
        imageSource={item.imageSource}
        imageUrl={item.imageUrl}
        kingdom={item.kingdomLabel}
        scientificName={item.scientificName}
      />
      <div className="flex flex-col gap-4 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap gap-2">
          <Badge>{item.kingdomLabel}</Badge>
          <Badge variant="outline">{item.categoryLabel}</Badge>
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="font-heading text-2xl font-semibold tracking-[-0.035em]">
            {item.indonesianName}
          </h2>
          <p className="font-medium italic text-muted-foreground">
            {item.scientificName}
          </p>
        </div>
      </div>
    </article>
  );
}

export function ComparisonSpeciesCards({
  speciesA,
  speciesB,
}: ComparisonSpeciesCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SpeciesPreview item={speciesA} />
      <SpeciesPreview item={speciesB} />
    </div>
  );
}
