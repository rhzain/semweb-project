import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { CompareControls } from "@/components/compare/compare-controls";
import { ComparisonSummary } from "@/components/compare/comparison-summary";
import { ComparisonTable } from "@/components/compare/comparison-table";
import { AIExplanationPanel } from "@/components/shared/ai-explanation-panel";
import { PageHeading } from "@/components/shared/page-heading";
import { QueryPanel } from "@/components/shared/query-panel";
import { StatusLine } from "@/components/shared/status-line";
import { useApi } from "@/hooks/use-api";
import { getJson } from "@/lib/api";
import type {
  AIExplanation,
  CompareResponse,
  SpeciesOptionsResponse,
} from "@/types/api";

function ComparePage() {
  const [params, setParams] = useSearchParams();
  const speciesA = params.get("species_a") || "kucing";
  const speciesB = params.get("species_b") || "harimau";
  const { data: optionsData } = useApi<SpeciesOptionsResponse>(
    "/api/species-options",
    { items: [] },
  );
  const { data, loading, error } = useApi<CompareResponse>(
    `/api/compare?species_a=${speciesA}&species_b=${speciesB}`,
    {
      comparison: [],
      conclusion: "",
      speciesA: null,
      speciesB: null,
      sparql: "",
    },
  );
  const [aiExplanation, setAiExplanation] = useState<AIExplanation | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    setAiExplanation(null);
  }, [speciesA, speciesB]);

  function updateSpecies(key: "species_a" | "species_b", value: string) {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next, { replace: true });
  }

  async function explainRelationshipWithAi() {
    setAiLoading(true);

    try {
      const result = await getJson<AIExplanation>(
        `/api/ai/explain/compare?species_a=${speciesA}&species_b=${speciesB}`,
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        description="Sistem menilai kedekatan dari kesamaan kingdom, phylum, kelas, ordo, family, dan genus."
        eyebrow="Relasi Taksonomi"
        title="Bandingkan Dua Spesies"
      />
      <CompareControls
        onChange={updateSpecies}
        options={optionsData.items}
        speciesA={speciesA}
        speciesB={speciesB}
      />
      <StatusLine
        count={data.comparison.length}
        error={error}
        label="tingkat relasi"
        loading={loading}
      />
      {data.speciesA && data.speciesB ? (
        <ComparisonSummary
          aiLoading={aiLoading}
          conclusion={data.conclusion}
          onExplain={explainRelationshipWithAi}
          speciesA={data.speciesA}
          speciesB={data.speciesB}
        />
      ) : null}
      <AIExplanationPanel explanation={aiExplanation} />
      <ComparisonTable
        rows={data.comparison}
        speciesA={data.speciesA}
        speciesB={data.speciesB}
      />
      <QueryPanel query={data.sparql} />
    </div>
  );
}

export default ComparePage;
