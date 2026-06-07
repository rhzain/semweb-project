import { useEffect, useState } from "react";
import { AlertCircle, ChevronRight, FileQuestion } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { DetailHero } from "@/components/detail/detail-hero";
import {
  LexiconInformation,
  TaxonomyInformation,
} from "@/components/detail/detail-information";
import { RelatedSpecies } from "@/components/detail/related-species";
import { AIExplanationPanel } from "@/components/shared/ai-explanation-panel";
import { QueryPanel } from "@/components/shared/query-panel";
import { StatusLine } from "@/components/shared/status-line";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useApi } from "@/hooks/use-api";
import { getJson } from "@/lib/api";
import type { AIExplanation, SpeciesDetailResponse } from "@/types/api";

function DetailPage() {
  const { speciesId = "" } = useParams();
  const { data, loading, error } = useApi<SpeciesDetailResponse>(
    `/api/species/${speciesId}`,
    {
      item: null,
      related: [],
      sparql: { detail: "", related: "" },
    },
  );
  const [aiExplanation, setAiExplanation] = useState<AIExplanation | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    setAiExplanation(null);
  }, [speciesId]);

  async function explainWithAi() {
    setAiLoading(true);

    try {
      const result = await getJson<AIExplanation>(
        `/api/ai/explain/species/${speciesId}`,
        { method: "POST" },
      );
      setAiExplanation(result);
    } catch (requestError: unknown) {
      setAiExplanation({
        answer: null,
        error:
          requestError instanceof Error
            ? requestError.message
            : "Permintaan AI gagal.",
        mode: "error",
      });
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) {
    return <StatusLine count={0} loading />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Gagal memuat detail spesies</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data.item) {
    return (
      <Empty className="border bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestion />
          </EmptyMedia>
          <EmptyTitle>Spesies tidak ditemukan</EmptyTitle>
          <EmptyDescription>
            Entri yang diminta tidak tersedia di knowledge graph.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const query = `${data.sparql.detail}\n\n${data.sparql.related}`.trim();

  return (
    <div className="flex flex-col gap-7">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link className="hover:text-primary" to="/data">
          Katalog
        </Link>
        <ChevronRight />
        <span>{data.item.categoryLabel}</span>
        <ChevronRight />
        <span className="font-medium text-primary">{data.item.indonesianName}</span>
      </nav>

      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <DetailHero
            aiLoading={aiLoading}
            item={data.item}
            onExplain={explainWithAi}
          />
          <LexiconInformation item={data.item} />
          <AIExplanationPanel
            className="border-l-4 border-l-primary"
            explanation={aiExplanation}
          />
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <TaxonomyInformation item={data.item} />
          <RelatedSpecies items={data.related} />
          <QueryPanel compact query={query} />
        </aside>
      </div>
    </div>
  );
}

export default DetailPage;
