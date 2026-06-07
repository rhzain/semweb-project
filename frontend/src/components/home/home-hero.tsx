import { ArrowRight, Database, Network } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function HomeHero() {
  return (
    <Card className="overflow-hidden bg-primary text-primary-foreground ring-primary/20">
      <CardHeader className="max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">
          Knowledge Graph Leksikon Indonesia
        </p>
        <CardTitle className="font-heading text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          Jelajahi nama ilmiah, nama lokal, dan relasi taksonomi flora-fauna.
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="max-w-3xl text-base leading-7 text-primary-foreground/75">
          Cari spesies melalui nama Indonesia, nama Latin, nama Inggris, phylum,
          family, genus, kategori, atau sinonim ilmiah. Semua hasil berasal dari
          RDF Turtle yang di-query melalui SPARQL.
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 border-primary-foreground/15 bg-primary-foreground/5">
        <Button asChild variant="secondary">
          <Link to="/data">
            <Database data-icon="inline-start" />
            Lihat semua data
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/graph">
            <Network data-icon="inline-start" />
            Buka graph
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
