import { useDeferredValue } from "react";
import { useSearchParams } from "react-router-dom";

import { DataFilters } from "@/components/data/data-filters";
import { FullScreenLoader } from "@/components/shared/full-screen-loader";
import { SparqlQueryButton } from "@/components/shared/sparql-query-button";
import { SpeciesGrid } from "@/components/shared/species-grid";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useApi } from "@/hooks/use-api";
import type { CategoriesResponse, SpeciesListResponse } from "@/types/api";

function DataPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const kingdom = params.get("kingdom") || "";
  const category = params.get("category") || "";
  const deferredParams = useDeferredValue(params.toString());

  const { data, loading, initialLoading, error } = useApi<SpeciesListResponse>(
    `/api/species?${deferredParams}`,
    { items: [], sparql: "" },
  );
  const { data: categoryData, initialLoading: categoriesInitialLoading } =
    useApi<CategoriesResponse>("/api/categories", {
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

  if (initialLoading || categoriesInitialLoading) {
    return <FullScreenLoader label="Memuat katalog spesies..." />;
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
          Katalog Spesies
        </h1>
        <p className="w-full text-base leading-7 text-muted-foreground sm:text-lg">
          Jelajahi flora dan fauna Indonesia melalui data leksikon, taksonomi,
          dan relasi yang tersimpan dalam knowledge graph.
        </p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <DataFilters
          category={category}
          categoryOptions={categoryOptions}
          kingdom={kingdom}
          onChange={updateParam}
          query={query}
        />

        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex min-h-10 items-center justify-between text-sm text-muted-foreground">
            {loading ? (
              <span>Memperbarui hasil...</span>
            ) : (
              <span>
                Menampilkan{" "}
                <strong className="text-foreground">{data.items.length}</strong>{" "}
                spesies
              </span>
            )}
            {!loading && data.sparql ? (
              <SparqlQueryButton query={data.sparql} />
            ) : null}
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Data katalog tidak dapat dimuat</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <SpeciesGrid items={data.items} />
        </div>
      </div>
    </div>
  );
}

export default DataPage;
