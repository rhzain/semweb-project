import { Network, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { SpeciesImage } from "@/components/shared/species-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import type { SpeciesDetail } from "@/types/api";

interface DetailHeroProps {
  item: SpeciesDetail;
  aiLoading: boolean;
  onExplain: () => void;
}

export function DetailHero({
  item,
  aiLoading,
  onExplain,
}: DetailHeroProps) {
  return (
    <Card className="overflow-hidden py-0">
      <SpeciesImage
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
            <CardTitle className="font-heading text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
              {item.indonesianName}
            </CardTitle>
            <p className="text-lg font-medium italic text-primary">
              {item.scientificName}
            </p>
          </div>
        </div>
      </div>
      <CardHeader className="pt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Nama Inggris
        </p>
        <p className="text-base font-medium">{item.englishName}</p>
      </CardHeader>
      <CardContent>
        <Separator className="mb-5" />
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sinonim ilmiah
          </p>
          <p className="text-sm leading-6">
            {item.scientificSynonyms || "Tidak ada sinonim yang tercatat."}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button disabled={aiLoading} onClick={onExplain} type="button">
          {aiLoading ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Sparkles data-icon="inline-start" />
          )}
          {aiLoading ? "Meminta AI..." : "Jelaskan dengan AI"}
        </Button>
        <Button asChild variant="outline">
          <Link to={`/graph?species_id=${item.id}`}>
            <Network data-icon="inline-start" />
            Lihat graph
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
