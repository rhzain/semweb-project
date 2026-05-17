from __future__ import annotations

from typing import Any

try:
    from ..queries import compare_query, detail_query, related_query
    from ..sparql_client import binding_value, normalize_rows, sparql_select
except ImportError:  # Supports direct execution with `python backend/app.py`.
    from queries import compare_query, detail_query, related_query
    from sparql_client import binding_value, normalize_rows, sparql_select


def get_species_detail(species_id: str) -> tuple[dict[str, str] | None, str | None, str]:
    """Fetch one species detail row and return the SPARQL used."""
    query = detail_query(species_id)
    bindings, error = sparql_select(query)
    if error or not bindings:
        return None, error, query
    return normalize_rows(bindings)[0], None, query


def get_related_species(species_id: str) -> tuple[list[dict[str, str]], str | None, str]:
    """Fetch species that share family or genus with the selected species."""
    query = related_query(species_id)
    bindings, error = sparql_select(query)
    return normalize_rows(bindings), error, query


def closeness_from_comparison(comparison_rows: list[dict[str, Any]]) -> str:
    """Summarize taxonomic closeness from compare query rows."""
    levels = ["Genus", "Family", "Ordo", "Kelas", "Phylum", "Kingdom"]
    conclusions = {
        "Genus": "sangat dekat karena berada dalam genus yang sama",
        "Family": "dekat karena berada dalam family yang sama",
        "Ordo": "cukup dekat karena berada dalam ordo yang sama",
        "Kelas": "agak jauh karena hanya sama sampai tingkat kelas",
        "Phylum": "jauh karena hanya sama sampai tingkat phylum",
        "Kingdom": "jauh karena hanya sama pada tingkat kingdom",
    }

    same_levels = {row["level"] for row in comparison_rows if row["same"]}
    for level in levels:
        if level in same_levels:
            return conclusions[level]
    return "tidak cukup dekat atau data taksonominya belum lengkap"


def get_species_comparison(species_a: str, species_b: str) -> dict[str, Any]:
    """Fetch detail rows and taxonomy comparison for two species IDs."""
    species_a_detail, detail_a_error, _ = get_species_detail(species_a)
    species_b_detail, detail_b_error, _ = get_species_detail(species_b)
    query = compare_query(species_a, species_b)
    bindings, compare_error = sparql_select(query)

    order = ["Kingdom", "Phylum", "Kelas", "Ordo", "Family", "Genus"]
    row_map = {
        binding_value(row, "level"): {
            "level": binding_value(row, "level"),
            "labelA": binding_value(row, "labelA"),
            "labelB": binding_value(row, "labelB"),
            "same": binding_value(row, "labelA") == binding_value(row, "labelB"),
        }
        for row in bindings
    }
    comparison = [row_map[level] for level in order if level in row_map]

    return {
        "speciesA": species_a_detail,
        "speciesB": species_b_detail,
        "comparison": comparison,
        "conclusion": closeness_from_comparison(comparison),
        "error": detail_a_error or detail_b_error or compare_error,
        "sparql": query.strip(),
    }
