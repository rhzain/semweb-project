import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { HomeFeatures } from "@/components/home/home-features";
import { HomeHero } from "@/components/home/home-hero";
import {
  HomeSearchForm,
  type HomeSearchValues,
} from "@/components/home/home-search-form";
import { useApi } from "@/hooks/use-api";
import type { CategoriesResponse } from "@/types/api";

const initialValues: HomeSearchValues = {
  q: "",
  kingdom: "",
  category: "",
};

function HomePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<HomeSearchValues>(initialValues);
  const { data: categoryData } = useApi<CategoriesResponse>("/api/categories", {
    categories: [],
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    const query = params.toString();
    navigate(query ? `/data?${query}` : "/data");
  }

  const categoryOptions = categoryData.categories.map((category) => ({
    label: category,
    value: category,
  }));

  return (
    <div className="flex flex-col gap-6">
      <HomeHero />
      <HomeSearchForm
        categoryOptions={categoryOptions}
        onChange={setValues}
        onSubmit={handleSubmit}
        values={values}
      />
      <HomeFeatures />
    </div>
  );
}

export default HomePage;
