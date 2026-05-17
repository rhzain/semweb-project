from __future__ import annotations

from flask import Blueprint, abort, jsonify, request

try:
    from ..config import SPARQL_ENDPOINT
    from ..queries import build_search_query, categories_query, graph_query, is_valid_species_id, species_options_query
    from ..services.ai_service import make_ai_response
    from ..services.graph_service import build_graph_payload
    from ..services.species_service import get_related_species, get_species_comparison, get_species_detail
    from ..sparql_client import binding_value, normalize_rows, sparql_select
except ImportError:  # Supports direct execution with `python backend/app.py`.
    from config import SPARQL_ENDPOINT
    from queries import build_search_query, categories_query, graph_query, is_valid_species_id, species_options_query
    from services.ai_service import make_ai_response
    from services.graph_service import build_graph_payload
    from services.species_service import get_related_species, get_species_comparison, get_species_detail
    from sparql_client import binding_value, normalize_rows, sparql_select


api_bp = Blueprint("api", __name__, url_prefix="/api")


def require_species_id(species_id: str) -> None:
    """Abort when a route receives an invalid species ID."""
    if not is_valid_species_id(species_id):
        abort(404)


@api_bp.get("/health")
def health():
    """Expose a small health check for Docker/local diagnostics."""
    return jsonify({"status": "ok", "sparqlEndpoint": SPARQL_ENDPOINT})


@api_bp.get("/categories")
def api_categories():
    """Return available category labels from the knowledge graph."""
    query = categories_query()
    bindings, error = sparql_select(query)
    return jsonify(
        {
            "categories": [binding_value(row, "category") for row in bindings],
            "error": error,
            "sparql": query.strip(),
        }
    )


@api_bp.get("/species-options")
def api_species_options():
    """Return species options for compare controls."""
    query = species_options_query()
    bindings, error = sparql_select(query)
    return jsonify({"items": normalize_rows(bindings), "error": error, "sparql": query.strip()})


@api_bp.get("/species")
def api_species():
    """Return catalog/search results for the current filters."""
    q = request.args.get("q", "").strip()
    kingdom = request.args.get("kingdom", "").strip()
    category = request.args.get("category", "").strip()
    query = build_search_query(q, kingdom, category)
    bindings, error = sparql_select(query)
    return jsonify({"items": normalize_rows(bindings), "error": error, "sparql": query.strip()})


@api_bp.get("/species/<species_id>")
def api_species_detail(species_id: str):
    """Return detail data, related species, and the SPARQL statements used."""
    require_species_id(species_id)
    species, detail_error, detail_sparql = get_species_detail(species_id)
    if not species and not detail_error:
        abort(404)

    related, related_error, related_sparql = get_related_species(species_id)
    return jsonify(
        {
            "item": species,
            "related": related,
            "error": detail_error or related_error,
            "sparql": {"detail": detail_sparql.strip(), "related": related_sparql.strip()},
        }
    )


@api_bp.get("/compare")
def api_compare():
    """Return taxonomic comparison for two species IDs."""
    species_a = request.args.get("species_a", "").strip()
    species_b = request.args.get("species_b", "").strip()
    if not species_a or not species_b:
        return jsonify({"comparison": [], "conclusion": "", "error": None})

    require_species_id(species_a)
    require_species_id(species_b)
    return jsonify(get_species_comparison(species_a, species_b))


@api_bp.post("/ai/explain/species/<species_id>")
def api_ai_explain_species(species_id: str):
    """Generate a natural-language explanation for one species detail page."""
    require_species_id(species_id)
    species, detail_error, detail_sparql = get_species_detail(species_id)
    if not species and not detail_error:
        abort(404)

    related, related_error, related_sparql = get_related_species(species_id)
    context = {
        "data_source": "Apache Jena Fuseki SPARQL endpoint",
        "knowledge_graph_role": "RDF/ontology/SPARQL adalah sumber data utama; Gemini hanya menjelaskan hasil query.",
        "species": species,
        "related_species": related,
        "sparql": {"detail": detail_sparql.strip(), "related": related_sparql.strip()},
        "sparql_error": detail_error or related_error,
    }
    return jsonify(make_ai_response("Jelaskan detail satu spesies berdasarkan entri leksikon dan relasi taksonomi hasil SPARQL.", context))


@api_bp.post("/ai/explain/compare")
def api_ai_explain_compare():
    """Generate a natural-language explanation for a species comparison."""
    species_a = request.args.get("species_a", "").strip()
    species_b = request.args.get("species_b", "").strip()
    if not species_a or not species_b:
        return jsonify({"answer": None, "error": "Pilih dua spesies terlebih dahulu.", "mode": "disabled"})

    require_species_id(species_a)
    require_species_id(species_b)
    comparison_payload = get_species_comparison(species_a, species_b)
    context = {
        "data_source": "Apache Jena Fuseki SPARQL endpoint",
        "knowledge_graph_role": "RDF/ontology/SPARQL adalah sumber data utama; Gemini hanya menjelaskan hasil query.",
        "species_a": comparison_payload["speciesA"],
        "species_b": comparison_payload["speciesB"],
        "comparison": comparison_payload["comparison"],
        "closeness_conclusion": comparison_payload["conclusion"],
        "sparql": comparison_payload["sparql"],
        "sparql_error": comparison_payload["error"],
    }
    return jsonify(make_ai_response("Jelaskan hubungan dua spesies berdasarkan kesamaan kingdom, phylum, kelas, ordo, family, dan genus hasil SPARQL.", context))


@api_bp.get("/graph")
def api_graph():
    """Return graph nodes and edges for all data or one species focus."""
    species_id = request.args.get("species_id", "").strip()
    if species_id:
        require_species_id(species_id)

    query = graph_query(species_id)
    bindings, error = sparql_select(query)
    rows = normalize_rows(bindings)
    return jsonify({"graph": build_graph_payload(rows, species_id), "error": error, "sparql": query.strip()})
