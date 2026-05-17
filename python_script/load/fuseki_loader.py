from __future__ import annotations

import base64
import os
import urllib.request
from pathlib import Path

from common.paths import ONTOLOGY_TURTLE, RDF_TURTLE

DEFAULT_FILES = [
    ONTOLOGY_TURTLE,
    RDF_TURTLE,
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
    """Read ontology and dataset Turtle files as one upload payload."""
    chunks = []
    for path in paths:
        chunks.append(path.read_text(encoding="utf-8"))
    return "\n\n".join(chunks).encode("utf-8")


def auth_header() -> str:
    """Build Basic Auth header for Fuseki Graph Store Protocol."""
    token = f"{FUSEKI_USER}:{FUSEKI_PASSWORD}".encode("utf-8")
    return "Basic " + base64.b64encode(token).decode("ascii")


def upload_turtle(data: bytes) -> None:
    """Replace the default Fuseki graph with the generated Turtle payload."""
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