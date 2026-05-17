from __future__ import annotations

import sys
import time
import urllib.error
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from load.fuseki_loader import DEFAULT_FILES, FUSEKI_DATA_URL, MAX_RETRIES, RETRY_SECONDS, read_combined_turtle, upload_turtle

class FusekiLoadPipeline:
    """Pipeline utama untuk memuat ontology dan RDF ke Apache Jena Fuseki."""

    def __init__(self, turtle_files: list[Path] | None = None) -> None:
        """Simpan daftar file Turtle yang akan digabung dan diupload."""
        self.turtle_files = turtle_files or DEFAULT_FILES
        self.payload: bytes = b""

    def validate_inputs(self) -> None:
        """Pastikan semua file Turtle yang dibutuhkan tersedia."""
        missing = [path for path in self.turtle_files if not path.exists()]
        if missing:
            raise FileNotFoundError(f"Turtle files not found: {missing}")

    def build_payload(self) -> None:
        """Gabungkan ontology dan RDF dataset menjadi satu payload."""
        self.payload = read_combined_turtle(self.turtle_files)

    def upload_with_retry(self) -> None:
        """Upload payload ke Fuseki dengan retry sampai Fuseki siap."""
        last_error = None
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                upload_turtle(self.payload)
                print(f"Loaded RDF into Fuseki: {FUSEKI_DATA_URL}")
                return
            except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, RuntimeError) as exc:
                last_error = exc
                print(f"Fuseki not ready or load failed ({attempt}/{MAX_RETRIES}): {exc}")
                time.sleep(RETRY_SECONDS)

        raise SystemExit(f"Failed to load RDF into Fuseki: {last_error}")

    def run(self) -> None:
        """Jalankan seluruh pipeline upload RDF ke Fuseki."""
        self.validate_inputs()
        self.build_payload()
        self.upload_with_retry()

def main() -> None:
    """Entry point command line untuk pipeline load Fuseki."""
    FusekiLoadPipeline().run()

if __name__ == "__main__":
    main()
