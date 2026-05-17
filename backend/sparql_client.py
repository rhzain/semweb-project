from __future__ import annotations

import json
from typing import Any

from SPARQLWrapper import JSON, SPARQLWrapper

try:
    from .config import SPARQL_ENDPOINT
except ImportError:  # Supports direct execution with `python backend/app.py`.
    from config import SPARQL_ENDPOINT


def sparql_literal(value: str) -> str:
    """Escape a Python string so it is safe to embed as a SPARQL literal."""
    return json.dumps(value, ensure_ascii=False)


def sparql_select(query: str) -> tuple[list[dict[str, Any]], str | None]:
    """Run a SPARQL SELECT query and return raw bindings with an optional error."""
    sparql = SPARQLWrapper(SPARQL_ENDPOINT)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)

    try:
        result = sparql.query().convert()
        return result["results"]["bindings"], None
    except Exception as exc:  # Depends on Fuseki availability.
        return [], str(exc)


def binding_value(binding: dict[str, Any], key: str) -> str:
    """Read one value from a SPARQLWrapper binding dictionary."""
    return binding.get(key, {}).get("value", "")


def normalize_rows(bindings: list[dict[str, Any]]) -> list[dict[str, str]]:
    """Flatten SPARQLWrapper bindings into plain dictionaries for JSON responses."""
    return [{key: item.get("value", "") for key, item in binding.items()} for binding in bindings]
