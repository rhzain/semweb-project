import { BookOpen, Network } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { SpeciesDetail } from "@/types/api";

interface DetailInformationProps {
  item: SpeciesDetail;
}

export function LexiconInformation({ item }: DetailInformationProps) {
  const rows = [
    ["Deskripsi", item.description || "Deskripsi belum tersedia."],
    ["Nama Indonesia", item.indonesianName],
    ["Nama ilmiah", item.scientificName],
    ["Nama Inggris", item.englishName],
    ["Sumber data", item.sourceData],
  ];

  return (
    <Card>
      <CardHeader className="grid grid-cols-[auto_1fr] items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
          <BookOpen />
        </span>
        <CardTitle className="text-xl">Entri Leksikon</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col">
          {rows.map(([label, value], index) => (
            <div key={label}>
              {index ? <Separator className="my-4" /> : null}
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-1 break-words text-sm leading-6">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

export function TaxonomyInformation({ item }: DetailInformationProps) {
  const rows = [
    ["Kingdom", item.kingdomLabel],
    ["Phylum", item.phylumLabel],
    ["Kelas", item.classLabel],
    ["Ordo", item.orderLabel],
    ["Family", item.familyLabel],
    ["Genus", item.genusLabel],
    ["Spesies", item.scientificName],
  ];

  return (
    <Card>
      <CardHeader className="grid grid-cols-[auto_1fr] items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
          <Network />
        </span>
        <CardTitle className="text-xl">Taksonomi</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col">
          {rows.map(([label, value], index) => (
            <li className="grid grid-cols-[24px_1fr] gap-3" key={label}>
              <div className="flex flex-col items-center">
                <span className="mt-1 size-2.5 rounded-full bg-primary" />
                {index < rows.length - 1 ? (
                  <span className="mt-1 min-h-8 w-px flex-1 bg-border" />
                ) : null}
              </div>
              <div className="pb-4">
                <p className="text-xs font-semibold text-muted-foreground">
                  {label}
                </p>
                <p className="mt-0.5 text-sm font-medium">{value}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
