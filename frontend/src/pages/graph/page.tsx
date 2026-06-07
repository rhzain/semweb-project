import { useSearchParams } from "react-router-dom";

import { GraphCanvas } from "@/components/graph/graph-canvas";
import { GraphToolbar } from "@/components/graph/graph-toolbar";
import { PageHeading } from "@/components/shared/page-heading";
import { QueryPanel } from "@/components/shared/query-panel";
import { StatusLine } from "@/components/shared/status-line";
import { useApi } from "@/hooks/use-api";
import type { GraphResponse, SpeciesOptionsResponse } from "@/types/api";

function GraphPage() {
  const [params, setParams] = useSearchParams();
  const speciesId = params.get("species_id") || "";
  const { data: optionsData } = useApi<SpeciesOptionsResponse>(
    "/api/species-options",
    { items: [] },
  );
  const { data, loading, error } = useApi<GraphResponse>(
    `/api/graph${speciesId ? `?species_id=${speciesId}` : ""}`,
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        description="Node spesies dihubungkan ke kingdom, phylum, kelas, ordo, family, genus, dan kategori melalui RDF property."
        eyebrow="Visualisasi Knowledge Graph"
        title="Graph Spesies dan Takson"
      />
      <GraphToolbar
        onChange={updateSpecies}
        options={optionsData.items}
        speciesId={speciesId}
      />
      <StatusLine
        count={data.graph.nodes.length}
        error={error}
        label="node"
        loading={loading}
      />
      <GraphCanvas graph={data.graph} />
      <QueryPanel query={data.sparql} />
    </div>
  );
}

export default GraphPage;
