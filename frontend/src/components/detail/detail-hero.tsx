import { Network, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge variant="secondary">{item.kingdomLabel}</Badge>
          <Badge variant="outline">{item.categoryLabel}</Badge>
        </div>
        <CardTitle className="font-heading text-3xl font-semibold tracking-tight sm:text-5xl">
          {item.indonesianName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-medium italic text-primary">
          {item.scientificName}
        </p>
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
