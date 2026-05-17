from __future__ import annotations

import sys
from pathlib import Path


sys.path.append(str(Path(__file__).resolve().parents[1]))

from common.paths import DATASET_CSV, RDF_TURTLE
from load.main import FusekiLoadPipeline
from rdf.main import CsvToRdfPipeline


class RefreshDataPipeline:
    """Pipeline gabungan untuk regenerate RDF lalu upload ulang ke Fuseki."""

    def __init__(self, csv_path: Path = DATASET_CSV, rdf_path: Path = RDF_TURTLE) -> None:
        """Simpan path dataset CSV dan output RDF."""
        self.csv_path = csv_path
        self.rdf_path = rdf_path

    def regenerate_rdf(self) -> None:
        """Jalankan pipeline konversi CSV ke RDF."""
        CsvToRdfPipeline(self.csv_path, self.rdf_path).run()

    def load_to_fuseki(self) -> None:
        """Jalankan pipeline upload RDF ke Fuseki."""
        FusekiLoadPipeline().run()

    def run(self) -> None:
        """Jalankan refresh data end-to-end."""
        self.regenerate_rdf()
        self.load_to_fuseki()


def main() -> None:
    """Entry point command line untuk pipeline refresh."""
    RefreshDataPipeline().run()


if __name__ == "__main__":
    main()
