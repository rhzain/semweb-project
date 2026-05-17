from __future__ import annotations

import csv
from pathlib import Path

from rdflib import Graph, Literal, Namespace, RDF, RDFS

from common.paths import DATASET_CSV, RDF_TURTLE
from common.text import slugify

DEFAULT_CSV = DATASET_CSV
DEFAULT_OUTPUT = RDF_TURTLE

FF = Namespace("http://example.org/flora-fauna/ontology#")
DATA = Namespace("http://example.org/flora-fauna/resource/")


def add_taxon(graph: Graph, value: str, taxon_type, prefix: str):
    """Create or reuse a taxon resource for a repeated taxonomy value."""
    uri = DATA[f"{prefix}_{slugify(value)}"]
    graph.add((uri, RDF.type, taxon_type))
    graph.add((uri, RDFS.label, Literal(value)))
    return uri


def row_search_text(row: dict[str, str]) -> str:
    """Combine searchable fields into one lowercase RDF literal."""
    fields = [
        "nama_latin",
        "nama_indonesia",
        "nama_inggris",
        "kingdom",
        "phylum",
        "kelas",
        "ordo",
        "family",
        "genus",
        "kategori",
        "sinonim_ilmiah",
    ]
    return " ".join(row.get(field, "") for field in fields if row.get(field, "")).lower()


def convert_csv_to_rdf(csv_path: Path, output_path: Path) -> None:
    """Convert the validated CSV dataset into RDF Turtle triples."""
    graph = Graph()
    graph.bind("ff", FF)
    graph.bind("data", DATA)
    graph.bind("rdf", RDF)
    graph.bind("rdfs", RDFS)

    with csv_path.open("r", encoding="utf-8", newline="") as csv_file:
        reader = csv.DictReader(csv_file)
        for row in reader:
            species = DATA[slugify(row["id"])]
            kingdom_value = row["kingdom"].strip()

            graph.add((species, RDF.type, FF.SpeciesEntry))
            if kingdom_value.lower() == "plantae":
                graph.add((species, RDF.type, FF.FloraEntry))
            elif kingdom_value.lower() == "animalia":
                graph.add((species, RDF.type, FF.FaunaEntry))

            label = f"{row['nama_indonesia']} ({row['nama_latin']})"
            graph.add((species, RDFS.label, Literal(label)))
            graph.add((species, FF.entryId, Literal(row["id"])))
            graph.add((species, FF.scientificName, Literal(row["nama_latin"])))
            graph.add((species, FF.indonesianName, Literal(row["nama_indonesia"], lang="id")))
            graph.add((species, FF.englishName, Literal(row["nama_inggris"], lang="en")))
            graph.add((species, FF.sourceData, Literal(row["sumber_data"])))
            graph.add((species, FF.searchText, Literal(row_search_text(row))))

            synonyms = [
                item.strip()
                for item in row.get("sinonim_ilmiah", "").split("|")
                if item.strip() and item.strip() not in {"-", "—"}
            ]
            for synonym in synonyms:
                graph.add((species, FF.scientificSynonym, Literal(synonym)))

            taxonomy = [
                ("kingdom", FF.Kingdom, "kingdom", FF.hasKingdom),
                ("phylum", FF.Phylum, "phylum", FF.hasPhylum),
                ("kelas", FF.TaxonomicClass, "class", FF.hasTaxonomicClass),
                ("ordo", FF.Order, "order", FF.hasOrder),
                ("family", FF.Family, "family", FF.hasFamily),
                ("genus", FF.Genus, "genus", FF.hasGenus),
                ("kategori", FF.Category, "category", FF.hasCategory),
            ]

            for csv_column, rdf_class, uri_prefix, rdf_property in taxonomy:
                value = row[csv_column].strip()
                taxon_uri = add_taxon(graph, value, rdf_class, uri_prefix)
                graph.add((species, rdf_property, taxon_uri))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    graph.serialize(destination=output_path, format="turtle")
