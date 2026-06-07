import { Database, Network, Sparkles, type LucideIcon } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Database,
    title: "Katalog data RDF",
    description:
      "Tampilkan seluruh entri leksikon sebagai katalog yang dapat dicari dan difilter.",
  },
  {
    icon: Network,
    title: "Visualisasi graph",
    description:
      "Lihat relasi spesies, kingdom, phylum, family, genus, dan kategori sebagai graph.",
  },
  {
    icon: Sparkles,
    title: "AI explanation",
    description:
      "Gemini menjelaskan hasil SPARQL tanpa menggantikan knowledge graph sebagai sumber data.",
  },
];

export function HomeFeatures() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {features.map(({ icon: Icon, title, description }) => (
        <Card key={title}>
          <CardHeader>
            <span className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon />
            </span>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="leading-6">{description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </section>
  );
}
