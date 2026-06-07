import { useEffect, useState } from "react";
import { AlertCircle, FileQuestion } from "lucide-react";
import { useParams } from "react-router-dom";

import { DetailHero } from "@/components/detail/detail-hero";
import { DetailInformation } from "@/components/detail/detail-information";
import { AIExplanationPanel } from "@/components/shared/ai-explanation-panel";
import { QueryPanel } from "@/components/shared/query-panel";
import { SectionHeading } from "@/components/shared/section-heading";
import { SpeciesGrid } from "@/components/shared/species-grid";
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
    <div className="flex flex-col gap-6">
      <DetailHero
        aiLoading={aiLoading}
        item={data.item}
        onExplain={explainWithAi}
      />
      <AIExplanationPanel explanation={aiExplanation} />
      <DetailInformation item={data.item} />
      <section className="flex flex-col gap-4">
        <SectionHeading
          description="Relasi dihitung dari kesamaan family atau genus dalam knowledge graph."
          title="Spesies Terkait"
        />
        <SpeciesGrid items={data.related} />
      </section>
      <QueryPanel query={query} />
    </div>
  );
}

export default DetailPage;
