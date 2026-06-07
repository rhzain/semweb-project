from __future__ import annotations

import csv
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


sys.path.append(str(Path(__file__).resolve().parents[1]))

from common.paths import (
    GBIF_RAW_CSV,
    SPECIES_ENRICHED_CSV,
    SPECIES_UI_CONTENT_CSV,
    WIKIDATA_RAW_CSV,
)


FIELDNAMES = [
    "id",
    "image_url",
    "image_source",
    "description",
    "description_source",
]
USER_AGENT = "FloraFaunaSemanticWeb/1.0 (academic project)"


def read_csv_by_id(path: Path) -> dict[str, dict[str, str]]:
    """Read a CSV into a dictionary keyed by its stable ID."""
    with path.open("r", encoding="utf-8", newline="") as csv_file:
        return {
            row["id"].strip(): row
            for row in csv.DictReader(csv_file)
            if row.get("id", "").strip()
        }


def fetch_json(url: str) -> dict[str, Any]:
    """Fetch JSON from a public data endpoint with a project user agent."""
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def wikidata_entity_id(url: str) -> str:
    """Extract a Wikidata Q-ID from its entity URL."""
    return url.rstrip("/").split("/")[-1] if url else ""


def commons_image(entity: dict[str, Any]) -> tuple[str, str]:
    """Build a display URL and source page from a Wikidata P18 image claim."""
    claims = entity.get("claims", {})
    image_claims = claims.get("P18", [])
    if not image_claims:
        return "", ""

    filename = (
        image_claims[0]
        .get("mainsnak", {})
        .get("datavalue", {})
        .get("value", "")
    )
    if not filename:
        return "", ""

    encoded_filename = urllib.parse.quote(filename.replace(" ", "_"))
    return (
        f"https://commons.wikimedia.org/wiki/Special:Redirect/file/{encoded_filename}?width=1200",
        f"https://commons.wikimedia.org/wiki/File:{encoded_filename}",
    )


def gbif_occurrence_image(gbif_key: str) -> tuple[str, str]:
    """Find one documented still image from a GBIF occurrence record."""
    if not gbif_key:
        return "", ""

    params = urllib.parse.urlencode(
        {"taxon_key": gbif_key, "media_type": "StillImage", "limit": 1}
    )
    payload = fetch_json(f"https://api.gbif.org/v1/occurrence/search?{params}")
    results = payload.get("results", [])
    if not results:
        return "", ""

    occurrence = results[0]
    media = occurrence.get("media", [])
    image_url = media[0].get("identifier", "") if media else ""
    occurrence_key = occurrence.get("key", "")
    source_url = (
        f"https://www.gbif.org/occurrence/{occurrence_key}"
        if occurrence_key
        else ""
    )
    return image_url, source_url


def generated_description(row: dict[str, str]) -> str:
    """Create a factual Indonesian summary using only validated project fields."""
    common_name = row["nama_indonesia"].strip()
    scientific_name = row["nama_latin"].strip()
    kingdom = row["kingdom"].strip()
    phylum = row["phylum"].strip()
    taxonomic_class = row["kelas"].strip()
    family = row["family"].strip()
    genus = row["genus"].strip()
    english_name = row["nama_inggris"].strip()
    entry_type = "flora" if kingdom.lower() == "plantae" else "fauna"

    return (
        f"{common_name} ({scientific_name}) merupakan entri leksikon {entry_type} "
        f"dalam kingdom {kingdom}, phylum {phylum}, dan kelas {taxonomic_class}. "
        f"Spesies ini tercatat pada family {family} dan genus {genus}. "
        f"Nama Inggris yang tercatat adalah {english_name}."
    )


def build_rows(delay_seconds: float = 0.1) -> list[dict[str, str]]:
    """Build UI enrichment dataset"""
    species_rows = read_csv_by_id(SPECIES_ENRICHED_CSV)
    gbif_rows = read_csv_by_id(GBIF_RAW_CSV)
    wikidata_rows = read_csv_by_id(WIKIDATA_RAW_CSV)
    existing_rows = (
        read_csv_by_id(SPECIES_UI_CONTENT_CSV)
        if SPECIES_UI_CONTENT_CSV.exists()
        else {}
    )
    output: list[dict[str, str]] = []

    for index, (species_id, row) in enumerate(species_rows.items(), start=1):
        wikidata_url = wikidata_rows.get(species_id, {}).get("wikidata_url", "")
        entity_id = wikidata_entity_id(wikidata_url)
        image_url = existing_rows.get(species_id, {}).get("image_url", "")
        image_source = existing_rows.get(species_id, {}).get("image_source", "")

        if not image_url and entity_id:
            try:
                payload = fetch_json(
                    "https://www.wikidata.org/wiki/Special:EntityData/"
                    f"{urllib.parse.quote(entity_id)}.json"
                )
                entity = payload.get("entities", {}).get(entity_id, {})
                image_url, image_source = commons_image(entity)
            except (OSError, ValueError, json.JSONDecodeError) as error:
                print(f"[{index:03d}] Wikidata image failed for {species_id}: {error}")

        if not image_url:
            gbif_key = gbif_rows.get(species_id, {}).get("gbif_key", "")
            try:
                image_url, image_source = gbif_occurrence_image(gbif_key)
            except (OSError, ValueError, json.JSONDecodeError) as error:
                print(f"[{index:03d}] GBIF image failed for {species_id}: {error}")

        output.append(
            {
                "id": species_id,
                "image_url": image_url,
                "image_source": image_source,
                "description": generated_description(row),
                "description_source": "Generated from validated project taxonomy fields",
            }
        )
        print(f"[{index:03d}/{len(species_rows)}] UI content: {species_id}")
        time.sleep(delay_seconds)

    return output


def main() -> None:
    """Generate the standalone UI content CSV."""
    rows = build_rows()
    SPECIES_UI_CONTENT_CSV.parent.mkdir(parents=True, exist_ok=True)
    with SPECIES_UI_CONTENT_CSV.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} UI content rows to {SPECIES_UI_CONTENT_CSV}")


if __name__ == "__main__":
    main()
