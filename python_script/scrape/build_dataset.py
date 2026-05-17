from __future__ import annotations

from common.csv_io import read_csv_rows
from common.paths import SPECIES_SEED_CSV
from common.text import slugify
from scrape.api_clients import (
    UNAVAILABLE,
    fetch_gbif_match,
    fetch_gbif_synonyms,
    fetch_gbif_vernacular_names,
    fetch_wikidata,
)


DATASET_FIELDNAMES = [
    "id",
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
    "sumber_data",
]

GBIF_RAW_FIELDNAMES = [
    "id",
    "input_query_name",
    "accepted_scientific_name",
    "gbif_key",
    "gbif_url",
    "kingdom",
    "phylum",
    "kelas",
    "ordo",
    "family",
    "genus",
    "nama_indonesia_api",
    "nama_inggris_api",
    "taxonomic_status",
    "rank",
    "seed_source",
    "seed_note",
]

WIKIDATA_RAW_FIELDNAMES = [
    "id",
    "input_query_name",
    "accepted_scientific_name",
    "wikidata_url",
    "label_id",
    "label_en",
    "kingdom",
    "phylum",
    "kelas",
    "ordo",
    "family",
    "genus",
    "seed_source",
    "seed_note",
]


def load_search_terms() -> list[dict[str, str]]:
    """Read species seed rows that define which names are queried to APIs."""
    return read_csv_rows(SPECIES_SEED_CSV)


def merge_taxonomy(gbif: dict, wikidata: dict[str, str], query_name: str) -> dict[str, str]:
    """Combine GBIF taxonomy with Wikidata taxonomy when GBIF leaves a field empty."""
    taxonomy = {
        "kingdom": gbif.get("kingdom", ""),
        "phylum": gbif.get("phylum", ""),
        "class": gbif.get("class", ""),
        "order": gbif.get("order", ""),
        "family": gbif.get("family", ""),
        "genus": gbif.get("genus", ""),
    }
    if wikidata:
        if not taxonomy["order"] and wikidata.get("order"):
            taxonomy["order"] = wikidata["order"]
        if wikidata.get("class") and taxonomy["class"] == taxonomy["order"]:
            taxonomy["class"] = wikidata["class"]
        if not taxonomy["class"] and wikidata.get("class"):
            taxonomy["class"] = wikidata["class"]
        if not taxonomy["kingdom"] and wikidata.get("kingdom"):
            taxonomy["kingdom"] = wikidata["kingdom"]
        if not taxonomy["phylum"] and wikidata.get("phylum"):
            taxonomy["phylum"] = wikidata["phylum"]
        if not taxonomy["family"] and wikidata.get("family"):
            taxonomy["family"] = wikidata["family"]
        if not taxonomy["genus"] and wikidata.get("genus"):
            taxonomy["genus"] = wikidata["genus"]

    missing = [field for field, value in taxonomy.items() if not value]
    if missing:
        raise RuntimeError(f"Taxonomy incomplete after GBIF/Wikidata validation for {query_name}: {missing}")
    return taxonomy


def choose_common_name(api_label: str, canonical_name: str) -> str:
    """Use API labels, but avoid replacing common names with scientific names."""
    if api_label and api_label.lower() != canonical_name.lower():
        return api_label
    return UNAVAILABLE


def choose_first_available(*values: str) -> str:
    """Return the first API value that is not blank or unavailable."""
    for value in values:
        if value and value != UNAVAILABLE:
            return value
    return UNAVAILABLE


def make_row(search_term: dict[str, str]) -> tuple[dict[str, str], dict[str, str], dict[str, str]]:
    """Build processed and raw rows from one species seed."""
    query_name = search_term["query_name"].strip()
    species_id = search_term.get("id", "").strip() or slugify(query_name)

    gbif = fetch_gbif_match(query_name)
    canonical_name = gbif["canonicalName"]
    key = gbif["key"]
    wikidata = fetch_wikidata(canonical_name)
    vernacular_names = fetch_gbif_vernacular_names(key, canonical_name)
    synonyms = fetch_gbif_synonyms(key)
    taxonomy = merge_taxonomy(gbif, wikidata, query_name)

    id_formatted = species_id.replace("_", " ").title()
    english_hint = search_term.get("nama_inggris", "").strip()

    common_id = choose_first_available(
        choose_common_name(wikidata.get("label_id", ""), canonical_name),
        choose_common_name(vernacular_names.get("label_id", ""), canonical_name),
        id_formatted
    )
    common_en = choose_first_available(
        choose_common_name(wikidata.get("label_en", ""), canonical_name),
        choose_common_name(vernacular_names.get("label_en", ""), canonical_name),
        english_hint if english_hint else UNAVAILABLE
    )
    gbif_url = f"https://www.gbif.org/species/{key}"

    source_parts = [f"GBIF: {gbif_url}"]
    if wikidata.get("url"):
        source_parts.append(f"Wikidata: {wikidata['url']}")

    output = {
        "id": species_id,
        "nama_latin": canonical_name,
        "nama_indonesia": common_id,
        "nama_inggris": common_en,
        "kingdom": taxonomy["kingdom"],
        "phylum": taxonomy["phylum"],
        "kelas": taxonomy["class"],
        "ordo": taxonomy["order"],
        "family": taxonomy["family"],
        "genus": taxonomy["genus"],
        "kategori": taxonomy["class"] or UNAVAILABLE,
        "sinonim_ilmiah": synonyms,
        "sumber_data": "; ".join(source_parts),
    }

    gbif_raw = {
        "id": species_id,
        "input_query_name": query_name,
        "accepted_scientific_name": canonical_name,
        "gbif_key": str(key),
        "gbif_url": gbif_url,
        "kingdom": gbif.get("kingdom", ""),
        "phylum": gbif.get("phylum", ""),
        "kelas": gbif.get("class", ""),
        "ordo": gbif.get("order", ""),
        "family": gbif.get("family", ""),
        "genus": gbif.get("genus", ""),
        "nama_indonesia_api": vernacular_names.get("label_id", ""),
        "nama_inggris_api": vernacular_names.get("label_en", ""),
        "taxonomic_status": gbif.get("taxonomicStatus", ""),
        "rank": gbif.get("rank", ""),
        "seed_source": search_term.get("seed_source", ""),
        "seed_note": search_term.get("seed_note", ""),
    }
    wikidata_raw = {
        "id": species_id,
        "input_query_name": query_name,
        "accepted_scientific_name": canonical_name,
        "wikidata_url": wikidata.get("url", ""),
        "label_id": wikidata.get("label_id", ""),
        "label_en": wikidata.get("label_en", ""),
        "kingdom": wikidata.get("kingdom", ""),
        "phylum": wikidata.get("phylum", ""),
        "kelas": wikidata.get("class", ""),
        "ordo": wikidata.get("order", ""),
        "family": wikidata.get("family", ""),
        "genus": wikidata.get("genus", ""),
        "seed_source": search_term.get("seed_source", ""),
        "seed_note": search_term.get("seed_note", ""),
    }
    return output, gbif_raw, wikidata_raw


def validate_dataset_counts(rows: list[dict[str, str]]) -> None:
    """Keep the project requirement fixed at 50 flora and 50 fauna entries."""
    flora_count = sum(1 for row in rows if row["kingdom"] == "Plantae")
    fauna_count = sum(1 for row in rows if row["kingdom"] == "Animalia")
    if flora_count != 50 or fauna_count != 50:
        raise RuntimeError(f"Expected 50 Plantae and 50 Animalia, got {flora_count} and {fauna_count}")
