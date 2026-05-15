from __future__ import annotations

import base64
import os
import time
import urllib.error
import urllib.request
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
DEFAULT_FILES = [
    BASE_DIR / "ontology" / "ontology.ttl",
    BASE_DIR / "data" / "flora_fauna.ttl",
]

FUSEKI_DATA_URL = os.getenv(
    "FUSEKI_DATA_URL",
    "http://fuseki:3030/flora-fauna/data?default",
)
FUSEKI_USER = os.getenv("FUSEKI_USER", "admin")
FUSEKI_PASSWORD = os.getenv("FUSEKI_PASSWORD", "admin")
MAX_RETRIES = int(os.getenv("FUSEKI_LOAD_RETRIES", "30"))
RETRY_SECONDS = int(os.getenv("FUSEKI_LOAD_RETRY_SECONDS", "2"))


def read_combined_turtle(paths: list[Path]) -> bytes:
    chunks = []
    for path in paths:
        chunks.append(path.read_text(encoding="utf-8"))
    return "\n\n".join(chunks).encode("utf-8")


def auth_header() -> str:
    token = f"{FUSEKI_USER}:{FUSEKI_PASSWORD}".encode("utf-8")
    return "Basic " + base64.b64encode(token).decode("ascii")


def upload_turtle(data: bytes) -> None:
    request = urllib.request.Request(
        FUSEKI_DATA_URL,
        data=data,
        method="PUT",
        headers={
            "Authorization": auth_header(),
            "Content-Type": "text/turtle; charset=utf-8",
        },
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        if response.status not in {200, 201, 204}:
            raise RuntimeError(f"Unexpected Fuseki response: {response.status}")


def main() -> None:
    combined_turtle = read_combined_turtle(DEFAULT_FILES)
    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            upload_turtle(combined_turtle)
            print(f"Loaded RDF into Fuseki: {FUSEKI_DATA_URL}")
            return
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, RuntimeError) as exc:
            last_error = exc
            print(f"Fuseki not ready or load failed ({attempt}/{MAX_RETRIES}): {exc}")
            time.sleep(RETRY_SECONDS)

    raise SystemExit(f"Failed to load RDF into Fuseki: {last_error}")


if __name__ == "__main__":
    main()

