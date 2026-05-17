from __future__ import annotations

import sys
import time
from pathlib import Path


sys.path.append(str(Path(__file__).resolve().parents[1]))

from common.csv_io import write_csv_rows
from common.paths import GBIF_RAW_CSV, SPECIES_ENRICHED_CSV, WIKIDATA_RAW_CSV
from scrape.build_dataset import (
    DATASET_FIELDNAMES,
    GBIF_RAW_FIELDNAMES,
    WIKIDATA_RAW_FIELDNAMES,
    load_search_terms,
    make_row,
    validate_dataset_counts,
)


class ScrapeDatasetPipeline:
    """Pipeline utama untuk scrape/enrichment dataset dari API terbuka."""

    def __init__(self, delay_seconds: float = 0.15) -> None:
        """Set jeda request agar tidak terlalu agresif ke API publik."""
        self.delay_seconds = delay_seconds
        self.search_terms: list[dict[str, str]] = []
        self.rows: list[dict[str, str]] = []
        self.gbif_rows: list[dict[str, str]] = []
        self.wikidata_rows: list[dict[str, str]] = []

    def load_inputs(self) -> None:
        """Load daftar query minimal yang akan dicari ke API."""
        self.search_terms = load_search_terms()
        print(f"Loaded {len(self.search_terms)} API search terms")

    def enrich_from_api(self) -> None:
        """Panggil API untuk tiap search term dan bentuk row dataset final."""
        for index, search_term in enumerate(self.search_terms, start=1):
            row, gbif_raw, wikidata_raw = make_row(search_term)
            self.rows.append(row)
            self.gbif_rows.append(gbif_raw)
            self.wikidata_rows.append(wikidata_raw)
            print(f"[{index:03d}/{len(self.search_terms)}] validated {row['nama_latin']} -> {row['kingdom']} {row['family']}")
            time.sleep(self.delay_seconds)

    def validate_outputs(self) -> None:
        """Validasi jumlah flora dan fauna sesuai requirement proyek."""
        validate_dataset_counts(self.rows)

    def write_outputs(self) -> None:
        """Tulis raw API dan dataset processed ke struktur data.csv."""
        write_csv_rows(GBIF_RAW_CSV, self.gbif_rows, GBIF_RAW_FIELDNAMES)
        write_csv_rows(WIKIDATA_RAW_CSV, self.wikidata_rows, WIKIDATA_RAW_FIELDNAMES)
        write_csv_rows(SPECIES_ENRICHED_CSV, self.rows, DATASET_FIELDNAMES)
        print(f"Wrote GBIF raw rows to {GBIF_RAW_CSV}")
        print(f"Wrote Wikidata raw rows to {WIKIDATA_RAW_CSV}")
        print(f"Wrote {len(self.rows)} enriched rows to {SPECIES_ENRICHED_CSV}")

    def run(self) -> None:
        """Jalankan seluruh pipeline scrape sampai CSV final terbentuk."""
        self.load_inputs()
        self.enrich_from_api()
        self.validate_outputs()
        self.write_outputs()


def main() -> None:
    """Entry point command line untuk pipeline scrape dataset."""
    ScrapeDatasetPipeline().run()


if __name__ == "__main__":
    main()
