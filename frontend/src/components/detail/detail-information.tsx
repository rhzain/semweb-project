import { InfoCard } from "@/components/shared/info-card";
import type { SpeciesDetail } from "@/types/api";

interface DetailInformationProps {
  item: SpeciesDetail;
}

export function DetailInformation({ item }: DetailInformationProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <InfoCard
        rows={[
          ["Nama Indonesia", item.indonesianName],
          ["Nama ilmiah", item.scientificName],
          ["Nama Inggris", item.englishName],
          ["Sinonim ilmiah", item.scientificSynonyms || "-"],
          ["Sumber data", item.sourceData],
        ]}
        title="Entri Leksikon"
      />
      <InfoCard
        rows={[
          ["Kingdom", item.kingdomLabel],
          ["Phylum", item.phylumLabel],
          ["Kelas", item.classLabel],
          ["Ordo", item.orderLabel],
          ["Family", item.familyLabel],
          ["Genus", item.genusLabel],
        ]}
        title="Taksonomi"
      />
    </section>
  );
}
