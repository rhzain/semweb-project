import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { SpeciesGrid } from "@/components/shared/species-grid";
import { Button } from "@/components/ui/button";
import type { SpeciesListItem } from "@/types/api";

interface HomeCatalogPreviewProps {
  items: SpeciesListItem[];
}

export function HomeCatalogPreview({ items }: HomeCatalogPreviewProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
            Katalog Spesies
          </h2>
          <p className="text-sm text-muted-foreground">
            Pilihan entri dari knowledge graph flora dan fauna.
          </p>
        </div>
        <Button asChild className="gap-1.5 hover:bg-transparent hover:font-semibold [&_svg]:transition-transform [&_svg]:hover:translate-x-1" variant="ghost">
          <Link to="/data">
            Lihat Semua
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </div>
      <SpeciesGrid className="lg:grid-cols-4 xl:grid-cols-4" items={items} />
    </section>
  );
}
