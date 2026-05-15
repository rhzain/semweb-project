from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any

import requests
from flask import Flask, abort, jsonify, request, send_from_directory
from SPARQLWrapper import JSON, SPARQLWrapper


BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

app = Flask(
    __name__,
    static_folder=str(FRONTEND_DIST / "assets"),
    static_url_path="/assets",
)

SPARQL_ENDPOINT = os.getenv(
    "SPARQL_ENDPOINT",
    "http://localhost:3030/flora-fauna/sparql",
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_BASE_URL = os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta").rstrip("/")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

AI_EXPLANATION_PROMPT_TEMPLATE = """
Anda adalah AI Explanation Assistant untuk aplikasi leksikon flora-fauna berbasis Semantic Web.

Peran Anda:
- Menjelaskan hasil query SPARQL dalam bahasa Indonesia yang natural.
- Menggunakan hanya data yang tersedia pada konteks JSON.
- Tidak menambahkan fakta, angka, habitat, status konservasi, atau relasi yang tidak ada dalam konteks.
- Jika sebuah fakta tidak tersedia di konteks, tulis bahwa data tersebut tidak tersedia.
- Tekankan bahwa data utama berasal dari Knowledge Graph/RDF/SPARQL, sedangkan Anda hanya membuat penjelasan natural language.

Jenis tugas:
{task}

Konteks hasil SPARQL dalam JSON:
{context_json}

Tulis jawaban ringkas, jelas, dan cocok untuk presentasi proyek Semantic Web.
"""

PREFIXES = """
PREFIX ff: <http://example.org/flora-fauna/ontology#>
PREFIX data: <http://example.org/flora-fauna/resource/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
"""

ALLOWED_KINGDOMS = {"Plantae", "Animalia"}
SPECIES_ID_PATTERN = re.compile(r"^[A-Za-z0-9_]+$")


def sparql_literal(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def sparql_select(query: str) -> tuple[list[dict[str, Any]], str | None]:
    sparql = SPARQLWrapper(SPARQL_ENDPOINT)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)

    try:
        result = sparql.query().convert()
        return result["results"]["bindings"], None
    except Exception as exc:  # pragma: no cover - depends on external Fuseki service.
        return [], str(exc)


def binding_value(binding: dict[str, Any], key: str) -> str:
    return binding.get(key, {}).get("value", "")


def normalize_rows(bindings: list[dict[str, Any]]) -> list[dict[str, str]]:
    return [{key: item.get("value", "") for key, item in binding.items()} for binding in bindings]


def validate_species_id(species_id: str) -> None:
    if not SPECIES_ID_PATTERN.match(species_id):
        abort(404)


def build_search_query(q: str = "", kingdom: str = "", category: str = "", limit: int = 200) -> str:
    filters = []

    if q:
        filters.append(
            f"""
            FILTER(
                CONTAINS(LCASE(STR(?searchText)), LCASE({sparql_literal(q)})) ||
                CONTAINS(LCASE(STR(?indonesianName)), LCASE({sparql_literal(q)})) ||
                CONTAINS(LCASE(STR(?scientificName)), LCASE({sparql_literal(q)})) ||
                CONTAINS(LCASE(STR(?englishName)), LCASE({sparql_literal(q)})) ||
                CONTAINS(LCASE(STR(?familyLabel)), LCASE({sparql_literal(q)})) ||
                CONTAINS(LCASE(STR(?genusLabel)), LCASE({sparql_literal(q)})) ||
                CONTAINS(LCASE(STR(?categoryLabel)), LCASE({sparql_literal(q)}))
            )
            """
        )

    if kingdom in ALLOWED_KINGDOMS:
        filters.append(f"FILTER(STR(?kingdomLabel) = {sparql_literal(kingdom)})")

    if category:
        filters.append(f"FILTER(LCASE(STR(?categoryLabel)) = LCASE({sparql_literal(category)}))")

    filter_block = "\n".join(filters)

    return f"""
{PREFIXES}

SELECT DISTINCT ?id ?scientificName ?indonesianName ?englishName
       ?kingdomLabel ?classLabel ?orderLabel ?familyLabel ?genusLabel
       ?categoryLabel ?habitatLabel ?description ?endemismStatus
WHERE {{
  ?species a ff:SpeciesEntry ;
           ff:entryId ?id ;
           ff:scientificName ?scientificName ;
           ff:indonesianName ?indonesianName ;
           ff:englishName ?englishName ;
           ff:description ?description ;
           ff:endemismStatus ?endemismStatus ;
           ff:searchText ?searchText ;
           ff:hasKingdom/rdfs:label ?kingdomLabel ;
           ff:hasTaxonomicClass/rdfs:label ?classLabel ;
           ff:hasOrder/rdfs:label ?orderLabel ;
           ff:hasFamily/rdfs:label ?familyLabel ;
           ff:hasGenus/rdfs:label ?genusLabel ;
           ff:hasCategory/rdfs:label ?categoryLabel ;
           ff:hasHabitat/rdfs:label ?habitatLabel .
  {filter_block}
}}
ORDER BY LCASE(STR(?indonesianName))
LIMIT {limit}
"""


def categories_query() -> str:
    return f"""
{PREFIXES}

SELECT DISTINCT ?category
WHERE {{
  ?species a ff:SpeciesEntry ;
           ff:hasCategory/rdfs:label ?category .
}}
ORDER BY LCASE(STR(?category))
"""


def species_options_query() -> str:
    return f"""
{PREFIXES}

SELECT DISTINCT ?id ?indonesianName ?scientificName ?kingdomLabel ?categoryLabel
WHERE {{
  ?species a ff:SpeciesEntry ;
           ff:entryId ?id ;
           ff:indonesianName ?indonesianName ;
           ff:scientificName ?scientificName ;
           ff:hasKingdom/rdfs:label ?kingdomLabel ;
           ff:hasCategory/rdfs:label ?categoryLabel .
}}
ORDER BY LCASE(STR(?indonesianName))
"""


def detail_query(species_id: str) -> str:
    return f"""
{PREFIXES}

SELECT ?id ?scientificName ?indonesianName ?englishName
       ?kingdomLabel ?classLabel ?orderLabel ?familyLabel ?genusLabel
       ?categoryLabel ?habitatLabel ?description ?endemismStatus ?sourceData
       (GROUP_CONCAT(DISTINCT ?synonym; separator=", ") AS ?scientificSynonyms)
WHERE {{
  data:{species_id} a ff:SpeciesEntry ;
           ff:entryId ?id ;
           ff:scientificName ?scientificName ;
           ff:indonesianName ?indonesianName ;
           ff:englishName ?englishName ;
           ff:description ?description ;
           ff:endemismStatus ?endemismStatus ;
           ff:sourceData ?sourceData ;
           ff:hasKingdom/rdfs:label ?kingdomLabel ;
           ff:hasTaxonomicClass/rdfs:label ?classLabel ;
           ff:hasOrder/rdfs:label ?orderLabel ;
           ff:hasFamily/rdfs:label ?familyLabel ;
           ff:hasGenus/rdfs:label ?genusLabel ;
           ff:hasCategory/rdfs:label ?categoryLabel ;
           ff:hasHabitat/rdfs:label ?habitatLabel .
  OPTIONAL {{ data:{species_id} ff:scientificSynonym ?synonym . }}
}}
GROUP BY ?id ?scientificName ?indonesianName ?englishName
         ?kingdomLabel ?classLabel ?orderLabel ?familyLabel ?genusLabel
         ?categoryLabel ?habitatLabel ?description ?endemismStatus ?sourceData
"""


def related_query(species_id: str) -> str:
    return f"""
{PREFIXES}

SELECT DISTINCT ?id ?indonesianName ?scientificName ?englishName
       ?kingdomLabel ?familyLabel ?genusLabel ?categoryLabel ?description ?relation
WHERE {{
  data:{species_id} ff:hasFamily ?family ;
                    ff:hasGenus ?genus .
  ?species a ff:SpeciesEntry ;
           ff:entryId ?id ;
           ff:indonesianName ?indonesianName ;
           ff:scientificName ?scientificName ;
           ff:englishName ?englishName ;
           ff:description ?description ;
           ff:hasKingdom/rdfs:label ?kingdomLabel ;
           ff:hasFamily ?family ;
           ff:hasFamily/rdfs:label ?familyLabel ;
           ff:hasGenus/rdfs:label ?genusLabel ;
           ff:hasCategory/rdfs:label ?categoryLabel .
  FILTER(?species != data:{species_id})
  BIND(IF(EXISTS {{ ?species ff:hasGenus ?genus }}, "Satu genus", "Satu family") AS ?relation)
}}
ORDER BY ?relation LCASE(STR(?indonesianName))
"""


def compare_query(species_a: str, species_b: str) -> str:
    return f"""
{PREFIXES}

SELECT ?level ?labelA ?labelB
WHERE {{
  VALUES (?level ?property) {{
    ("Kingdom" ff:hasKingdom)
    ("Kelas" ff:hasTaxonomicClass)
    ("Ordo" ff:hasOrder)
    ("Family" ff:hasFamily)
    ("Genus" ff:hasGenus)
  }}
  data:{species_a} ?property ?taxonA .
  data:{species_b} ?property ?taxonB .
  ?taxonA rdfs:label ?labelA .
  ?taxonB rdfs:label ?labelB .
}}
"""


def graph_query(species_id: str = "") -> str:
    if species_id:
        validate_species_id(species_id)
        species_filter = f"""
        {{
          data:{species_id} ff:hasFamily ?focusFamily ;
                            ff:hasGenus ?focusGenus .
          ?species a ff:SpeciesEntry ;
                   ff:entryId ?id ;
                   ff:indonesianName ?indonesianName ;
                   ff:scientificName ?scientificName ;
                   ff:hasFamily ?focusFamily .
        }}
        UNION
        {{
          data:{species_id} ff:entryId ?id ;
                            ff:indonesianName ?indonesianName ;
                            ff:scientificName ?scientificName .
          BIND(data:{species_id} AS ?species)
        }}
        """
    else:
        species_filter = """
        ?species a ff:SpeciesEntry ;
                 ff:entryId ?id ;
                 ff:indonesianName ?indonesianName ;
                 ff:scientificName ?scientificName .
        """

    return f"""
{PREFIXES}

SELECT DISTINCT ?id ?indonesianName ?scientificName
       ?kingdomLabel ?classLabel ?orderLabel ?familyLabel ?genusLabel ?categoryLabel
WHERE {{
  {species_filter}
  ?species ff:hasKingdom/rdfs:label ?kingdomLabel ;
           ff:hasTaxonomicClass/rdfs:label ?classLabel ;
           ff:hasOrder/rdfs:label ?orderLabel ;
           ff:hasFamily/rdfs:label ?familyLabel ;
           ff:hasGenus/rdfs:label ?genusLabel ;
           ff:hasCategory/rdfs:label ?categoryLabel .
}}
ORDER BY LCASE(STR(?indonesianName))
LIMIT 120
"""


def get_species_detail(species_id: str) -> tuple[dict[str, str] | None, str | None, str]:
    query = detail_query(species_id)
    bindings, error = sparql_select(query)
    if error or not bindings:
        return None, error, query
    return normalize_rows(bindings)[0], None, query


def closeness_from_comparison(comparison_rows: list[dict[str, Any]]) -> str:
    levels = ["Genus", "Family", "Ordo", "Kelas", "Kingdom"]
    conclusions = {
        "Genus": "sangat dekat karena berada dalam genus yang sama",
        "Family": "dekat karena berada dalam family yang sama",
        "Ordo": "cukup dekat karena berada dalam ordo yang sama",
        "Kelas": "agak jauh karena hanya sama sampai tingkat kelas",
        "Kingdom": "jauh karena hanya sama pada tingkat kingdom",
    }

    same_levels = {row["level"] for row in comparison_rows if row["same"]}
    for level in levels:
        if level in same_levels:
            return conclusions[level]
    return "tidak cukup dekat atau data taksonominya belum lengkap"


def build_graph_payload(rows: list[dict[str, str]], focus_id: str = "") -> dict[str, Any]:
    nodes: dict[str, dict[str, Any]] = {}
    edges: list[dict[str, str]] = []
    edge_ids: set[str] = set()

    def add_node(node_id: str, label: str, node_type: str, **extra: Any) -> None:
        nodes.setdefault(node_id, {"id": node_id, "label": label, "type": node_type, **extra})

    def add_edge(source: str, target: str, label: str) -> None:
        edge_id = f"{source}->{target}:{label}"
        if edge_id not in edge_ids:
            edges.append({"id": edge_id, "source": source, "target": target, "label": label})
            edge_ids.add(edge_id)

    taxonomy_fields = [
        ("kingdomLabel", "Kingdom", "has kingdom"),
        ("classLabel", "Class", "has class"),
        ("orderLabel", "Order", "has order"),
        ("familyLabel", "Family", "has family"),
        ("genusLabel", "Genus", "has genus"),
        ("categoryLabel", "Category", "has category"),
    ]

    for row in rows:
        species_node = f"species:{row['id']}"
        add_node(
            species_node,
            row["indonesianName"],
            "Species",
            scientificName=row["scientificName"],
            focus=str(row["id"] == focus_id).lower(),
        )
        for field, node_type, label in taxonomy_fields:
            taxon_value = row.get(field, "")
            if not taxon_value:
                continue
            taxon_node = f"{node_type.lower()}:{taxon_value}"
            add_node(taxon_node, taxon_value, node_type)
            add_edge(species_node, taxon_node, label)

    return {"nodes": list(nodes.values()), "edges": edges}


def build_ai_prompt(task: str, context: dict[str, Any]) -> str:
    context_json = json.dumps(context, ensure_ascii=False, indent=2)
    return AI_EXPLANATION_PROMPT_TEMPLATE.format(task=task, context_json=context_json)


def call_gemini(prompt: str) -> tuple[str | None, str | None]:
    if not GEMINI_API_KEY:
        return None, "GEMINI_API_KEY belum diset. Fitur AI Explanation Assistant bersifat opsional."

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
        },
    }

    try:
        response = requests.post(
            f"{GEMINI_BASE_URL}/models/{GEMINI_MODEL}:generateContent",
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY,
            },
            json=payload,
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        parts = data["candidates"][0]["content"]["parts"]
        text = "\n".join(part.get("text", "") for part in parts).strip()
        return text or None, None
    except Exception as exc:  # pragma: no cover - external API.
        return None, str(exc)


def make_ai_response(task: str, context: dict[str, Any]) -> dict[str, Any]:
    prompt = build_ai_prompt(task, context)
    answer, error = call_gemini(prompt)
    return {
        "answer": answer,
        "error": error,
        "mode": "gemini" if answer else "disabled",
        "model": GEMINI_MODEL,
        "promptTemplate": AI_EXPLANATION_PROMPT_TEMPLATE.strip(),
        "context": context,
    }


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "sparqlEndpoint": SPARQL_ENDPOINT})


@app.get("/api/categories")
def api_categories():
    query = categories_query()
    bindings, error = sparql_select(query)
    return jsonify(
        {
            "categories": [binding_value(row, "category") for row in bindings],
            "error": error,
            "sparql": query.strip(),
        }
    )


@app.get("/api/species-options")
def api_species_options():
    query = species_options_query()
    bindings, error = sparql_select(query)
    return jsonify({"items": normalize_rows(bindings), "error": error, "sparql": query.strip()})


@app.get("/api/species")
def api_species():
    q = request.args.get("q", "").strip()
    kingdom = request.args.get("kingdom", "").strip()
    category = request.args.get("category", "").strip()
    query = build_search_query(q, kingdom, category)
    bindings, error = sparql_select(query)
    return jsonify({"items": normalize_rows(bindings), "error": error, "sparql": query.strip()})


@app.get("/api/species/<species_id>")
def api_species_detail(species_id: str):
    validate_species_id(species_id)
    species, detail_error, detail_sparql = get_species_detail(species_id)
    if not species and not detail_error:
        abort(404)

    related_sparql = related_query(species_id)
    related_bindings, related_error = sparql_select(related_sparql)

    return jsonify(
        {
            "item": species,
            "related": normalize_rows(related_bindings),
            "error": detail_error or related_error,
            "sparql": {
                "detail": detail_sparql.strip(),
                "related": related_sparql.strip(),
            },
        }
    )


@app.get("/api/compare")
def api_compare():
    species_a = request.args.get("species_a", "").strip()
    species_b = request.args.get("species_b", "").strip()
    if not species_a or not species_b:
        return jsonify({"comparison": [], "conclusion": "", "error": None})

    validate_species_id(species_a)
    validate_species_id(species_b)

    species_a_detail, detail_a_error, _ = get_species_detail(species_a)
    species_b_detail, detail_b_error, _ = get_species_detail(species_b)
    query = compare_query(species_a, species_b)
    bindings, compare_error = sparql_select(query)

    order = ["Kingdom", "Kelas", "Ordo", "Family", "Genus"]
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

    return jsonify(
        {
            "speciesA": species_a_detail,
            "speciesB": species_b_detail,
            "comparison": comparison,
            "conclusion": closeness_from_comparison(comparison),
            "error": detail_a_error or detail_b_error or compare_error,
            "sparql": query.strip(),
        }
    )


@app.post("/api/ai/explain/species/<species_id>")
def api_ai_explain_species(species_id: str):
    validate_species_id(species_id)
    species, detail_error, detail_sparql = get_species_detail(species_id)
    if not species and not detail_error:
        abort(404)

    related_sparql = related_query(species_id)
    related_bindings, related_error = sparql_select(related_sparql)
    related = normalize_rows(related_bindings)

    context = {
        "data_source": "Apache Jena Fuseki SPARQL endpoint",
        "knowledge_graph_role": "RDF/ontology/SPARQL adalah sumber data utama; Gemini hanya menjelaskan hasil query.",
        "species": species,
        "related_species": related,
        "sparql": {
            "detail": detail_sparql.strip(),
            "related": related_sparql.strip(),
        },
        "sparql_error": detail_error or related_error,
    }
    response = make_ai_response(
        "Jelaskan detail satu spesies berdasarkan entri leksikon dan relasi taksonomi hasil SPARQL.",
        context,
    )
    return jsonify(response)


@app.post("/api/ai/explain/compare")
def api_ai_explain_compare():
    species_a = request.args.get("species_a", "").strip()
    species_b = request.args.get("species_b", "").strip()
    if not species_a or not species_b:
        return jsonify({"answer": None, "error": "Pilih dua spesies terlebih dahulu.", "mode": "disabled"})

    validate_species_id(species_a)
    validate_species_id(species_b)

    species_a_detail, detail_a_error, _ = get_species_detail(species_a)
    species_b_detail, detail_b_error, _ = get_species_detail(species_b)
    query = compare_query(species_a, species_b)
    bindings, compare_error = sparql_select(query)
    order = ["Kingdom", "Kelas", "Ordo", "Family", "Genus"]
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
    context = {
        "data_source": "Apache Jena Fuseki SPARQL endpoint",
        "knowledge_graph_role": "RDF/ontology/SPARQL adalah sumber data utama; Gemini hanya menjelaskan hasil query.",
        "species_a": species_a_detail,
        "species_b": species_b_detail,
        "comparison": comparison,
        "closeness_conclusion": closeness_from_comparison(comparison),
        "sparql": query.strip(),
        "sparql_error": detail_a_error or detail_b_error or compare_error,
    }
    response = make_ai_response(
        "Jelaskan hubungan dua spesies berdasarkan kesamaan kingdom, kelas, ordo, family, dan genus hasil SPARQL.",
        context,
    )
    return jsonify(response)


@app.get("/api/graph")
def api_graph():
    species_id = request.args.get("species_id", "").strip()
    query = graph_query(species_id)
    bindings, error = sparql_select(query)
    rows = normalize_rows(bindings)
    return jsonify(
        {
            "graph": build_graph_payload(rows, species_id),
            "error": error,
            "sparql": query.strip(),
        }
    )


@app.get("/")
@app.get("/data")
@app.get("/species/<path:_species_id>")
@app.get("/compare")
@app.get("/graph")
def serve_frontend(_species_id: str | None = None):
    index_file = FRONTEND_DIST / "index.html"
    if not index_file.exists():
        return (
            "Frontend build belum tersedia. Jalankan `npm install && npm run build` "
            "di folder frontend, atau gunakan `docker compose up --build`.",
            503,
        )
    return send_from_directory(FRONTEND_DIST, "index.html")


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
    )
