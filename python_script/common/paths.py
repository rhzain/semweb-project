from __future__ import annotations

from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_CSV_DIR = PROJECT_ROOT / "data.csv"
SEED_DIR = DATA_CSV_DIR / "seed"
RAW_DIR = DATA_CSV_DIR / "raw"
PROCESSED_DIR = DATA_CSV_DIR / "processed"
UI_DIR = DATA_CSV_DIR / "ui"
RDF_DIR = PROJECT_ROOT / "rdf"
ONTOLOGY_DIR = PROJECT_ROOT / "ontology"

SPECIES_SEED_CSV = SEED_DIR / "species_seed.csv"
GBIF_RAW_CSV = RAW_DIR / "gbif_results.csv"
WIKIDATA_RAW_CSV = RAW_DIR / "wikidata_results.csv"
SPECIES_ENRICHED_CSV = PROCESSED_DIR / "species_enriched.csv"
SPECIES_UI_CONTENT_CSV = UI_DIR / "species_content.csv"
DATASET_CSV = SPECIES_ENRICHED_CSV
RDF_TURTLE = RDF_DIR / "flora_fauna.ttl"
ONTOLOGY_TURTLE = ONTOLOGY_DIR / "ontology.ttl"
