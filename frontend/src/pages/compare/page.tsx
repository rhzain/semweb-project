import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Sparkles } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { CompareControls } from "@/components/compare/compare-controls";
import { ComparisonSpeciesCards } from "@/components/compare/comparison-species-cards";
import { ComparisonTable } from "@/components/compare/comparison-table";
import { AIExplanationPanel } from "@/components/shared/ai-explanation-panel";
import { FullScreenLoader } from "@/components/shared/full-screen-loader";
import { SparqlQueryButton } from "@/components/shared/sparql-query-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useApi } from "@/hooks/use-api";
import { getJson } from "@/lib/api";
import type {
  AIExplanation,
  CompareResponse,
  SpeciesOptionsResponse,
} from "@/types/api";

function formatLevelList(levels: string[]) {
  if (levels.length === 0) return "";
  if (levels.length === 1) return levels[0];
  if (levels.length === 2) return `${levels[0]} dan ${levels[1]}`;

  return `${levels.slice(0, -1).join(", ")}, dan ${levels[levels.length - 1]}`;
}

function describeSharedDepth(level: string) {
  switch (level) {
    case "Genus":
      return "Ini menunjukkan hubungan yang sangat dekat karena keduanya masih berada dalam genus yang sama.";
    case "Family":
      return "Ini menunjukkan hubungan yang dekat pada tingkat family, meskipun genusnya sudah berbeda.";
    case "Ordo":
      return "Ini menunjukkan hubungan menengah: masih berada dalam ordo yang sama, tetapi percabangan taksonominya sudah terlihat lebih awal.";
    case "Kelas":
      return "Ini menunjukkan hubungan umum pada tingkat kelas, bukan hubungan spesies yang dekat.";
    case "Phylum":
      return "Ini menunjukkan hubungan yang cukup luas karena kesamaan hanya bertahan sampai phylum.";
    case "Kingdom":
      return "Ini menunjukkan hubungan yang sangat umum karena kesamaan utamanya hanya pada kingdom.";
    default:
      return "Ini menunjukkan hubungan taksonomi yang dapat dibaca dari tingkat terdalam yang masih sama.";
  }
}

function buildComparisonInsight(data: CompareResponse) {
  if (!data.speciesA || !data.speciesB || data.comparison.length === 0) {
    return data.conclusion;
  }

  if (data.speciesA.id === data.speciesB.id) {
    return `${data.speciesA.indonesianName} dan ${data.speciesB.indonesianName} mengarah ke entri spesies yang sama, sehingga seluruh tingkat taksonomi utama yang dibandingkan identik.`;
  }

  const sameRows = data.comparison.filter((row) => row.same);
  const differentRows = data.comparison.filter((row) => !row.same);
  const sameLevels = sameRows.map((row) => row.level);
  const deepestShared = sameRows[sameRows.length - 1];
  const firstDifferent = differentRows[0];
  const sharedSummary = sameRows.length
    ? `Keduanya berbagi ${sameRows.length} dari ${data.comparison.length} tingkat taksonomi utama: ${formatLevelList(sameLevels)}.`
    : "Keduanya tidak berbagi tingkat taksonomi utama pada hasil perbandingan ini.";
  const depthSummary = deepestShared
    ? describeSharedDepth(deepestShared.level)
    : "Relasi keduanya jauh dalam struktur taksonomi yang tersedia.";
  const differenceSummary = firstDifferent
    ? `Pembeda pertama muncul pada ${firstDifferent.level.toLowerCase()}: ${data.speciesA.indonesianName} tercatat sebagai ${firstDifferent.labelA}, sedangkan ${data.speciesB.indonesianName} tercatat sebagai ${firstDifferent.labelB}.`
    : "Tidak ada perbedaan pada tingkat taksonomi utama, sehingga pemisahannya berada pada identitas spesies atau data rinci di bawah genus.";

  return `${sharedSummary} ${depthSummary} ${differenceSummary}`;
}

function ComparePage() {
  const [params, setParams] = useSearchParams();
  const speciesA = params.get("species_a") || "kucing";
  const speciesB = params.get("species_b") || "harimau";
  const compareQuery = useMemo(
    () =>
      new URLSearchParams({
        species_a: speciesA,
        species_b: speciesB,
      }).toString(),
    [speciesA, speciesB],
  );
  const comparisonKey = `${speciesA}:${speciesB}`;
  const { data: optionsData, initialLoading: optionsInitialLoading } =
    useApi<SpeciesOptionsResponse>("/api/species-options", { items: [] });
  const { data, loading, initialLoading, error } = useApi<CompareResponse>(
    `/api/compare?${compareQuery}`,
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
  const aiPanelRef = useRef<HTMLDivElement>(null);
  const comparisonKeyRef = useRef(comparisonKey);

  useEffect(() => {
    comparisonKeyRef.current = comparisonKey;
    setAiExplanation(null);
    setAiLoading(false);
  }, [comparisonKey]);

  function updateSpecies(key: "species_a" | "species_b", value: string) {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next, { replace: true });
  }

  async function explainRelationshipWithAi() {
    const requestedComparisonKey = comparisonKey;
    setAiLoading(true);

    setTimeout(() => {
      aiPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    try {
      const aiQuery = new URLSearchParams({
        species_a: speciesA,
        species_b: speciesB,
      }).toString();
      const result = await getJson<AIExplanation>(
        `/api/ai/explain/compare?${aiQuery}`,
        { method: "POST" },
      );
      if (comparisonKeyRef.current === requestedComparisonKey) {
        setAiExplanation(result);
      }
    } catch (requestError: unknown) {
      if (comparisonKeyRef.current === requestedComparisonKey) {
        setAiExplanation({
          answer: null,
          error:
            requestError instanceof Error
              ? requestError.message
              : "Permintaan AI gagal.",
          mode: "error",
        });
      }
    } finally {
      if (comparisonKeyRef.current === requestedComparisonKey) {
        setAiLoading(false);
      }
    }
  }

  if (initialLoading || optionsInitialLoading) {
    return <FullScreenLoader label="Memuat perbandingan spesies..." />;
  }

  const hasCurrentComparison =
    data.speciesA?.id === speciesA && data.speciesB?.id === speciesB;
  const showComparison =
    Boolean(data.speciesA && data.speciesB) && hasCurrentComparison;
  const comparisonInsight = buildComparisonInsight(data);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
          Bandingkan Spesies
        </h1>
        <p className="w-full text-base leading-7 text-muted-foreground sm:text-lg">
          Bandingkan dua spesies melalui keselarasan kingdom, phylum, kelas,
          ordo, family, dan genus berdasarkan relasi taksonomi dalam knowledge
          graph.
        </p>
      </header>

      <CompareControls
        onChange={updateSpecies}
        options={optionsData.items}
        speciesA={speciesA}
        speciesB={speciesB}
      />

      {error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>SPARQL tidak dapat dimuat</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {showComparison && data.speciesA && data.speciesB ? (
        <>
          <ComparisonSpeciesCards
            speciesA={data.speciesA}
            speciesB={data.speciesB}
          />

          <ComparisonTable
            rows={data.comparison}
            speciesA={data.speciesA}
            speciesB={data.speciesB}
          />

          {comparisonInsight ? (
            <section className="flex w-full flex-col gap-2 text-card-foreground">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Kesimpulan
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {comparisonInsight}
              </p>
            </section>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              className="h-10 rounded-sm text-sm font-medium"
              disabled={aiLoading}
              onClick={explainRelationshipWithAi}
              type="button"
            >
              {aiLoading ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Sparkles data-icon="inline-start" />
              )}
              {aiLoading ? "Meminta AI..." : "Jelaskan dengan AI"}
            </Button>
            <SparqlQueryButton
              className="h-10 w-full justify-center rounded-sm text-sm font-medium [&_svg]:size-4"
              query={data.sparql}
            />
          </div>

          <div ref={aiPanelRef}>
            <AIExplanationPanel
              className="rounded-sm"
              explanation={aiExplanation}
              isLoading={aiLoading}
            />
          </div>
        </>
      ) : !loading && !error ? (
        <p className="rounded-sm border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          Pilih dua spesies untuk melihat perbandingan taksonomi.
        </p>
      ) : null}
    </div>
  );
}

export default ComparePage;
