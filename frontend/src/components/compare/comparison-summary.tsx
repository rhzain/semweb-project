import { Sparkles } from "lucide-react";

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

interface ComparisonSummaryProps {
  speciesA: SpeciesDetail;
  speciesB: SpeciesDetail;
  conclusion: string;
  aiLoading: boolean;
  onExplain: () => void;
}

export function ComparisonSummary({
  speciesA,
  speciesB,
  conclusion,
  aiLoading,
  onExplain,
}: ComparisonSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {speciesA.indonesianName} vs {speciesB.indonesianName}
        </CardTitle>
        <p className="text-sm font-medium italic text-primary">
          {speciesA.scientificName} &middot; {speciesB.scientificName}
        </p>
      </CardHeader>
      <CardContent>
        <p className="rounded-lg bg-muted p-4 text-sm leading-6">
          <strong>Kesimpulan:</strong> {conclusion}.
        </p>
      </CardContent>
      <CardFooter>
        <Button disabled={aiLoading} onClick={onExplain} type="button">
          {aiLoading ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Sparkles data-icon="inline-start" />
          )}
          {aiLoading ? "Meminta AI..." : "Jelaskan Hubungan dengan AI"}
        </Button>
      </CardFooter>
    </Card>
  );
}
