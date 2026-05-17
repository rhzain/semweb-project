from __future__ import annotations

import argparse
import sys
from pathlib import Path


sys.path.append(str(Path(__file__).resolve().parents[1]))

from common.paths import DATASET_CSV, RDF_TURTLE
from rdf.converter import convert_csv_to_rdf


class CsvToRdfPipeline:
    """Pipeline utama untuk mengonversi dataset CSV menjadi RDF Turtle."""

    def __init__(self, csv_path: Path, output_path: Path) -> None:
        """Simpan path input dan output pipeline."""
        self.csv_path = csv_path
        self.output_path = output_path

    @classmethod
    def from_cli(cls) -> "CsvToRdfPipeline":
        """Buat pipeline dari argumen command line."""
        parser = argparse.ArgumentParser(description="Convert flora-fauna CSV data to RDF Turtle.")
        parser.add_argument("--csv", type=Path, default=DATASET_CSV, help="Input CSV path.")
        parser.add_argument("--output", type=Path, default=RDF_TURTLE, help="Output Turtle path.")
        args = parser.parse_args()
        return cls(args.csv, args.output)

    def validate_inputs(self) -> None:
        """Pastikan CSV input sudah tersedia sebelum konversi."""
        if not self.csv_path.exists():
            raise FileNotFoundError(f"CSV input not found: {self.csv_path}")

    def convert(self) -> None:
        """Jalankan konversi CSV ke RDF Turtle."""
        convert_csv_to_rdf(self.csv_path, self.output_path)

    def run(self) -> None:
        """Jalankan seluruh pipeline RDF."""
        self.validate_inputs()
        self.convert()
        print(f"RDF Turtle generated: {self.output_path}")


def main() -> None:
    """Entry point command line untuk pipeline RDF."""
    CsvToRdfPipeline.from_cli().run()


if __name__ == "__main__":
    main()
