import { BookOpen, ExternalLink, Network } from "lucide-react";

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
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center text-primary">
          <BookOpen />
        </span>
        <h2 className="text-xl font-semibold tracking-tight">Entri Leksikon</h2>
      </div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-[160px_1fr]">
        {rows.map(([label, value]) => {
          const isUrl = typeof value === "string" && value.startsWith("http");
          let content: React.ReactNode = value;

          if (label === "Sumber data" && typeof value === "string" && value.includes("http")) {
            const parts = value.split(";").map((p) => p.trim()).filter(Boolean);
            content = (
              <div className="flex flex-wrap items-center gap-4">
                {parts.map((part) => {
                  const match = part.match(/^(.*?):\s*(https?:\/\/[^\s]+)$/);
                  if (match) {
                    return (
                      <a
                        key={match[2]}
                        className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                        href={match[2]}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {match[1]}
                        <ExternalLink className="size-3.5" />
                      </a>
                    );
                  }
                  return <span key={part}>{part}</span>;
                })}
              </div>
            );
          } else if (isUrl) {
            content = (
              <a
                className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                href={value as string}
                rel="noreferrer"
                target="_blank"
              >
                Kunjungi tautan sumber
                <ExternalLink className="size-3.5" />
              </a>
            );
          }

          return (
            <div className="grid gap-1.5 sm:contents" key={label}>
              <dt className="text-sm font-semibold text-muted-foreground">
                {label}
              </dt>
              <dd className="break-words text-sm leading-6">{content}</dd>
            </div>
          );
        })}
      </dl>
    </section>
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
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center text-primary">
          <Network />
        </span>
        <h2 className="text-xl font-semibold tracking-tight">Taksonomi</h2>
      </div>
      <ol className="flex flex-col">
        {rows.map(([label, value], index) => (
          <li className="grid grid-cols-[24px_1fr] gap-3" key={label}>
            <div className="flex flex-col items-center">
              <span className="mt-1.5 size-2.5 rounded-full bg-primary" />
              {index < rows.length - 1 ? (
                <span className="mt-1 min-h-8 w-px flex-1 bg-border" />
              ) : null}
            </div>
            <div className="pb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <p className="mt-0.5 text-sm font-medium">{value}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
