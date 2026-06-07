import { useDeferredValue } from "react";
import { useSearchParams } from "react-router-dom";

import { DataFilters } from "@/components/data/data-filters";
import { PageHeading } from "@/components/shared/page-heading";
import { QueryPanel } from "@/components/shared/query-panel";
import { SpeciesGrid } from "@/components/shared/species-grid";
import { StatusLine } from "@/components/shared/status-line";
import { useApi } from "@/hooks/use-api";
import type { CategoriesResponse, SpeciesListResponse } from "@/types/api";

function DataPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const kingdom = params.get("kingdom") || "";
  const category = params.get("category") || "";
  const deferredParams = useDeferredValue(params.toString());

  const { data, loading, error } = useApi<SpeciesListResponse>(
    `/api/species?${deferredParams}`,
    { items: [], sparql: "" },
  );
  const { data: categoryData } = useApi<CategoriesResponse>("/api/categories", {
    categories: [],
  });

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    setParams(next, { replace: true });
  }

  const categoryOptions = categoryData.categories.map((item) => ({
    label: item,
    value: item,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        description="Katalog ini menampilkan seluruh entri leksikon yang dimuat dari RDF Turtle ke SPARQL endpoint."
        eyebrow="Katalog RDF"
        title="Semua Data Flora dan Fauna"
      />
      <DataFilters
        category={category}
        categoryOptions={categoryOptions}
        kingdom={kingdom}
        onChange={updateParam}
        query={query}
      />
      <StatusLine count={data.items.length} error={error} loading={loading} />
      <SpeciesGrid items={data.items} />
      <QueryPanel query={data.sparql} />
    </div>
  );
}

export default DataPage;
