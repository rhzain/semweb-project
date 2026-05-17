from __future__ import annotations

import html
import json
import re
import urllib.parse
import urllib.request


GBIF_MATCH_URL = "https://api.gbif.org/v1/species/match"
GBIF_SPECIES_URL = "https://api.gbif.org/v1/species"
WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql"
UNAVAILABLE = "Tidak tersedia dari API"

INDONESIAN_LANGUAGE_CODES = ["ind", "id"]
ENGLISH_LANGUAGE_CODES = ["eng", "en"]
VERNACULAR_SOURCE_PRIORITY = [
    "The IUCN Red List",
    "Mammal Species of the World",
    "Integrated Taxonomic Information System",
    "Catalogue of Life",
]


def fetch_json(url: str, params: dict[str, str] | None = None) -> dict:
    """Fetch JSON data from an HTTP API with a stable project user agent."""
    if params:
        url = url + "?" + urllib.parse.urlencode(params)

    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "flora-fauna-semantic-web-course-project/1.0",
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def fetch_gbif_child_endpoint(key: int, endpoint: str, limit: int = 100) -> dict:
    """Fetch optional GBIF child endpoint data without stopping the whole scrape."""
    try:
        return fetch_json(f"{GBIF_SPECIES_URL}/{key}/{endpoint}", {"limit": str(limit)})
    except Exception:
        return {}


def fetch_gbif_match(name: str) -> dict:
    """Match a scientific name to an accepted GBIF species record."""
    match = fetch_json(GBIF_MATCH_URL, {"name": name, "rank": "SPECIES", "strict": "false"})
    key = match.get("acceptedUsageKey") or match.get("usageKey")
    if not key:
        raise RuntimeError(f"GBIF match not found: {name}")

    species = fetch_json(f"{GBIF_SPECIES_URL}/{key}")
    required = ["kingdom", "phylum", "family", "genus", "canonicalName"]
    missing = [field for field in required if not species.get(field)]
    if missing:
        raise RuntimeError(f"GBIF taxonomy incomplete for {name}: {missing}")
    return species


def fetch_gbif_synonyms(key: int) -> str:
    """Return up to five canonical scientific synonyms from GBIF."""
    try:
        data = fetch_json(f"{GBIF_SPECIES_URL}/{key}/synonyms", {"limit": "5"})
    except Exception:
        return "-"

    names = []
    for result in data.get("results", []):
        canonical = result.get("canonicalName")
        if canonical:
            names.append(canonical)
    return "|".join(dict.fromkeys(names)) or "-"


def normalize_candidate_text(value: str) -> str:
    """Clean compact API text values before writing them to CSV."""
    without_tags = re.sub(r"<[^>]+>", " ", value)
    decoded = html.unescape(without_tags)
    return " ".join(decoded.replace("\n", " ").replace("\r", " ").split())


def is_scientific_label(label: str, scientific_name: str) -> bool:
    """Detect labels that only repeat the scientific name."""
    return label.strip().lower() == scientific_name.strip().lower()


def source_score(source: str) -> int:
    """Score source names so stronger checklist sources are chosen first."""
    for index, source_name in enumerate(VERNACULAR_SOURCE_PRIORITY):
        if source_name.lower() in source.lower():
            return len(VERNACULAR_SOURCE_PRIORITY) - index
    return 0


def choose_vernacular_name(results: list[dict], languages: list[str], scientific_name: str) -> str:
    """Choose the best vernacular name for one language group."""
    candidates = []
    for index, row in enumerate(results):
        if row.get("language") not in languages:
            continue
        name = normalize_candidate_text(row.get("vernacularName", ""))
        if not name or is_scientific_label(name, scientific_name):
            continue
        first_name = normalize_candidate_text(name.split(",")[0])
        candidates.append(
            {
                "name": first_name,
                "score": source_score(row.get("source", "")),
                "index": index,
            }
        )

    if not candidates:
        return ""

    candidates.sort(key=lambda item: (-item["score"], item["index"], len(item["name"])))
    return candidates[0]["name"]


def fetch_gbif_vernacular_names(key: int, scientific_name: str) -> dict[str, str]:
    """Fetch Indonesian and English common names from GBIF vernacularNames."""
    data = fetch_gbif_child_endpoint(key, "vernacularNames", limit=200)
    results = data.get("results", [])
    return {
        "label_id": choose_vernacular_name(results, INDONESIAN_LANGUAGE_CODES, scientific_name),
        "label_en": choose_vernacular_name(results, ENGLISH_LANGUAGE_CODES, scientific_name),
    }


def fetch_wikidata(scientific_name: str) -> dict[str, str]:
    """Fetch labels and taxonomy from Wikidata."""
    query = f"""
    SELECT ?item ?itemLabel ?itemLabelEn
           ?rank ?taxonName ?taxonLabel WHERE {{
      ?item wdt:P225 {json.dumps(scientific_name)} .
      OPTIONAL {{ ?item rdfs:label ?itemLabel FILTER(LANG(?itemLabel) = "id") }}
      OPTIONAL {{ ?item rdfs:label ?itemLabelEn FILTER(LANG(?itemLabelEn) = "en") }}
      OPTIONAL {{
        ?item wdt:P171* ?taxon .
        ?taxon wdt:P105 ?rank .
        VALUES ?rank {{ wd:Q36732 wd:Q38348 wd:Q37517 wd:Q36602 wd:Q35409 wd:Q34740 }}
        OPTIONAL {{ ?taxon wdt:P225 ?taxonName . }}
        OPTIONAL {{ ?taxon rdfs:label ?taxonLabel FILTER(LANG(?taxonLabel) = "en") }}
      }}
    }}
    """
    try:
        data = fetch_json(WIKIDATA_SPARQL_URL, {"query": query, "format": "json"})
    except Exception:
        return {}

    bindings = data.get("results", {}).get("bindings", [])
    if not bindings:
        return {}

    result = {
        "url": bindings[0].get("item", {}).get("value", ""),
        "label_id": "",
        "label_en": "",
        "kingdom": "",
        "phylum": "",
        "class": "",
        "order": "",
        "family": "",
        "genus": "",
    }
    rank_map = {
        "http://www.wikidata.org/entity/Q36732": "kingdom",
        "http://www.wikidata.org/entity/Q38348": "phylum",
        "http://www.wikidata.org/entity/Q37517": "class",
        "http://www.wikidata.org/entity/Q36602": "order",
        "http://www.wikidata.org/entity/Q35409": "family",
        "http://www.wikidata.org/entity/Q34740": "genus",
    }
    for row in bindings:
        result["label_id"] = result["label_id"] or row.get("itemLabel", {}).get("value", "")
        result["label_en"] = result["label_en"] or row.get("itemLabelEn", {}).get("value", "")

        rank = row.get("rank", {}).get("value", "")
        field = rank_map.get(rank)
        if field and not result[field]:
            result[field] = row.get("taxonName", {}).get("value") or row.get("taxonLabel", {}).get("value", "")

    return result
