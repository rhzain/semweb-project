import { SpeciesImage } from "@/components/shared/species-image";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { SpeciesDetail } from "@/types/api";

interface DetailHeroProps {
  item: SpeciesDetail;
}

export function DetailHero({ item }: DetailHeroProps) {
  return (
    <div className="flex flex-col">
      <SpeciesImage
        blurredBackdrop
        className="aspect-[16/8] w-full min-h-56"
        imageSource={item.imageSource}
        imageUrl={item.imageUrl}
        kingdom={item.kingdomLabel}
        scientificName={item.scientificName}
        showSourceLink
      />
      <div className="px-6 pt-7 sm:px-8">
        <div className="flex max-w-2xl flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            <Badge>{item.kingdomLabel}</Badge>
            <Badge variant="outline">{item.categoryLabel}</Badge>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
              {item.indonesianName}
            </h1>
            <p className="text-lg font-medium italic text-primary">
              {item.scientificName}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 px-6 pt-6 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Nama Inggris
        </p>
        <p className="text-base font-medium">{item.englishName}</p>
      </div>
      <div className="px-6 pb-6 pt-6 sm:px-8">
        <Separator className="mb-5" />
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sinonim ilmiah
          </p>
          <p className="text-sm leading-6">
            {item.scientificSynonyms || "Tidak ada sinonim yang tercatat."}
          </p>
        </div>
      </div>
    </div>
  );
}
