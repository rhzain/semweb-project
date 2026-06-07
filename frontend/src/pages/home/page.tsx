import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { HomeCatalogPreview } from "@/components/home/home-catalog-preview";
import { HomeHero } from "@/components/home/home-hero";
import {
  HomeSearchForm,
  type HomeSearchValues,
} from "@/components/home/home-search-form";
import { FullScreenLoader } from "@/components/shared/full-screen-loader";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { useApi } from "@/hooks/use-api";
import type { CategoriesResponse, SpeciesListResponse } from "@/types/api";

const initialValues: HomeSearchValues = {
  q: "",
};

function HomePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<HomeSearchValues>(initialValues);
  const { data: categoryData, initialLoading: categoriesInitialLoading } =
    useApi<CategoriesResponse>("/api/categories", {
      categories: [],
    });
  const { data: speciesData, initialLoading: speciesInitialLoading } =
    useApi<SpeciesListResponse>("/api/species", {
      items: [],
      sparql: "",
    });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    if (values.q) {
      params.set("q", values.q);
    }

    const query = params.toString();
    navigate(query ? `/data?${query}` : "/data");
  }

  if (categoriesInitialLoading || speciesInitialLoading) {
    return <FullScreenLoader label="Memuat leksikon flora dan fauna..." />;
  }

  return (
    <div className="flex flex-col gap-20 pb-8 sm:gap-24">
      <section className="flex min-h-[calc(100svh-9rem)] flex-col items-center justify-center gap-10 pb-20 sm:pb-28">
        <ScrollReveal className="w-full">
          <HomeHero />
        </ScrollReveal>
        <ScrollReveal className="w-full" delay={120}>
          <HomeSearchForm
            categories={categoryData.categories}
            onChange={setValues}
            onSubmit={handleSubmit}
            values={values}
          />
        </ScrollReveal>
      </section>
      <ScrollReveal className="w-full" delay={80} y={36}>
        <HomeCatalogPreview items={speciesData.items.slice(0, 4)} />
      </ScrollReveal>
    </div>
  );
}

export default HomePage;
