import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";

import { GraphCanvas } from "@/components/graph/graph-canvas";
import { GraphToolbar } from "@/components/graph/graph-toolbar";
import { FullScreenLoader } from "@/components/shared/full-screen-loader";
import { SparqlQueryButton } from "@/components/shared/sparql-query-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useApi } from "@/hooks/use-api";
import type { GraphResponse, SpeciesOptionsResponse } from "@/types/api";

function GraphPage() {
  const [params, setParams] = useSearchParams();
  const speciesId = params.get("species_id") || "";
  const graphPath = useMemo(() => {
    const next = new URLSearchParams();
    if (speciesId) {
      next.set("species_id", speciesId);
    }

    const queryString = next.toString();
    return `/api/graph${queryString ? `?${queryString}` : ""}`;
  }, [speciesId]);
  const { data: optionsData, initialLoading: optionsInitialLoading } =
    useApi<SpeciesOptionsResponse>("/api/species-options", { items: [] });
  const { data, loading, initialLoading, error } = useApi<GraphResponse>(
    graphPath,
    {
      graph: { nodes: [], edges: [] },
      sparql: "",
    },
  );

  function updateSpecies(value: string) {
    const next = new URLSearchParams(params);

    if (value) {
      next.set("species_id", value);
    } else {
      next.delete("species_id");
    }

    setParams(next, { replace: true });
  }

  if (initialLoading || optionsInitialLoading) {
    return <FullScreenLoader label="Memuat knowledge graph..." />;
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
          Knowledge Graph
        </h1>
        <p className="w-full text-base leading-7 text-muted-foreground sm:text-lg">
          Telusuri hubungan spesies dengan kingdom, phylum, kelas, ordo,
          family, genus, dan kategori melalui struktur RDF yang tersimpan di
          knowledge graph.
        </p>
      </header>

      <GraphToolbar
        onChange={updateSpecies}
        options={optionsData.items}
        speciesId={speciesId}
      />

      <div className="flex flex-col gap-3">
        <div className="flex min-h-8 flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          {!loading ? (
            <span>
              Menampilkan{" "}
              <strong className="text-foreground">
                {data.graph.nodes.length}
              </strong>{" "}
              node dan{" "}
              <strong className="text-foreground">
                {data.graph.edges.length}
              </strong>{" "}
              relasi
            </span>
          ) : null}
          {!loading && data.sparql ? (
            <SparqlQueryButton query={data.sparql} />
          ) : null}
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Knowledge graph tidak dapat dimuat</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      <GraphCanvas graph={data.graph} />
    </div>
  );
}

export default GraphPage;
