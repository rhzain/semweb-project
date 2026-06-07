import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, FileQuestion, Network, Sparkles } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { DetailHero } from "@/components/detail/detail-hero";
import {
  LexiconInformation,
  TaxonomyInformation,
} from "@/components/detail/detail-information";
import { RelatedSpecies } from "@/components/detail/related-species";
import { AIExplanationPanel } from "@/components/shared/ai-explanation-panel";
import { FullScreenLoader } from "@/components/shared/full-screen-loader";
import { SparqlQueryButton } from "@/components/shared/sparql-query-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useApi } from "@/hooks/use-api";
import { getJson } from "@/lib/api";
import type { AIExplanation, SpeciesDetailResponse } from "@/types/api";

function DetailPage() {
  const navigate = useNavigate();
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
  const aiPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAiExplanation(null);
  }, [speciesId]);

  async function explainWithAi() {
    setAiLoading(true);
    
    // Auto-scroll to the AI panel
    setTimeout(() => {
      aiPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

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
    return <FullScreenLoader label="Memuat detail spesies..." />;
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
      <button
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        onClick={() => navigate(-1)}
        type="button"
      >
        <ArrowLeft className="size-4" />
        Kembali
      </button>

      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="rounded-sm border bg-card text-card-foreground overflow-hidden">
            <DetailHero item={data.item} />
            <Separator />
            <div className="px-6 py-6 sm:px-8 sm:py-8">
              <LexiconInformation item={data.item} />
            </div>
          </div>
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <TaxonomyInformation item={data.item} />
          <RelatedSpecies items={data.related} />
          
          <div className="flex flex-col gap-3">
            <SparqlQueryButton className="h-[52px] w-full justify-start rounded-sm text-sm font-medium [&_svg]:size-4" query={query} />
            <Button asChild className="h-[52px] w-full justify-start rounded-sm text-sm font-medium [&_svg]:size-4" variant="outline">
              <Link to={`/graph?species_id=${data.item.id}`}>
                <Network data-icon="inline-start" />
                Lihat graph
              </Link>
            </Button>
            <Button
              className="h-[52px] w-full justify-start rounded-sm text-sm font-medium [&_svg]:size-4"
              disabled={aiLoading}
              onClick={explainWithAi}
              type="button"
            >
              {aiLoading ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Sparkles data-icon="inline-start" />
              )}
              {aiLoading ? "Meminta AI..." : "Jelaskan dengan AI"}
            </Button>
          </div>
        </aside>
      </div>

      <div ref={aiPanelRef}>
        <AIExplanationPanel
          explanation={aiExplanation}
          isLoading={aiLoading}
        />
      </div>
    </div>
  );
}

export default DetailPage;
