from __future__ import annotations

import re

try:
    from .sparql_client import sparql_literal
except ImportError:  # Supports direct execution with `python backend/app.py`.
    from sparql_client import sparql_literal


PREFIXES = """
PREFIX ff: <http://example.org/flora-fauna/ontology#>
PREFIX data: <http://example.org/flora-fauna/resource/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
"""

ALLOWED_KINGDOMS = {"Plantae", "Animalia"}
SPECIES_ID_PATTERN = re.compile(r"^[A-Za-z0-9_]+$")


def is_valid_species_id(species_id: str) -> bool:
    """Return true when a species ID can be used as a safe prefixed SPARQL name."""
    return bool(SPECIES_ID_PATTERN.match(species_id))


def build_search_query(q: str = "", kingdom: str = "", category: str = "", limit: int = 200) -> str:
    """Build the catalog/search query with optional text, kingdom, and category filters."""
    filters = []
    if q:
        filters.append(
            f"""
            FILTER(
                CONTAINS(LCASE(STR(?searchText)), LCASE({sparql_literal(q)})) ||
                CONTAINS(LCASE(STR(?indonesianName)), LCASE({sparql_literal(q)})) ||
                CONTAINS(LCASE(STR(?scientificName)), LCASE({sparql_literal(q)})) ||
                CONTAINS(LCASE(STR(?englishName)), LCASE({sparql_literal(q)})) ||
                CONTAINS(LCASE(STR(?phylumLabel)), LCASE({sparql_literal(q)})) ||
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

    return f"""
{PREFIXES}

SELECT DISTINCT ?id ?scientificName ?indonesianName ?englishName
       ?kingdomLabel ?phylumLabel ?classLabel ?orderLabel ?familyLabel ?genusLabel
       ?categoryLabel ?sourceData ?description ?imageUrl ?imageSource
WHERE {{
  ?species a ff:SpeciesEntry ;
           ff:entryId ?id ;
           ff:scientificName ?scientificName ;
           ff:indonesianName ?indonesianName ;
           ff:englishName ?englishName ;
           ff:sourceData ?sourceData ;
           ff:searchText ?searchText ;
           ff:hasKingdom/rdfs:label ?kingdomLabel ;
           ff:hasPhylum/rdfs:label ?phylumLabel ;
           ff:hasTaxonomicClass/rdfs:label ?classLabel ;
           ff:hasOrder/rdfs:label ?orderLabel ;
           ff:hasFamily/rdfs:label ?familyLabel ;
           ff:hasGenus/rdfs:label ?genusLabel ;
           ff:hasCategory/rdfs:label ?categoryLabel .
  OPTIONAL {{ ?species ff:description ?description . }}
  OPTIONAL {{ ?species ff:imageUrl ?imageUrl . }}
  OPTIONAL {{ ?species ff:imageSource ?imageSource . }}
  {"".join(filters)}
}}
ORDER BY LCASE(STR(?indonesianName))
LIMIT {limit}
"""


def categories_query() -> str:
    """Build a query for category filters used by the frontend."""
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
    """Build a lightweight species option query for compare dropdowns."""
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
    """Build a detail query for one species entry."""
    return f"""
{PREFIXES}

SELECT ?id ?scientificName ?indonesianName ?englishName
       ?kingdomLabel ?phylumLabel ?classLabel ?orderLabel ?familyLabel ?genusLabel
       ?categoryLabel ?sourceData ?description ?descriptionSource ?imageUrl ?imageSource
       (GROUP_CONCAT(DISTINCT ?synonym; separator=", ") AS ?scientificSynonyms)
WHERE {{
  data:{species_id} a ff:SpeciesEntry ;
           ff:entryId ?id ;
           ff:scientificName ?scientificName ;
           ff:indonesianName ?indonesianName ;
           ff:englishName ?englishName ;
           ff:sourceData ?sourceData ;
           ff:hasKingdom/rdfs:label ?kingdomLabel ;
           ff:hasPhylum/rdfs:label ?phylumLabel ;
           ff:hasTaxonomicClass/rdfs:label ?classLabel ;
           ff:hasOrder/rdfs:label ?orderLabel ;
           ff:hasFamily/rdfs:label ?familyLabel ;
           ff:hasGenus/rdfs:label ?genusLabel ;
           ff:hasCategory/rdfs:label ?categoryLabel .
  OPTIONAL {{ data:{species_id} ff:scientificSynonym ?synonym . }}
  OPTIONAL {{ data:{species_id} ff:description ?description . }}
  OPTIONAL {{ data:{species_id} ff:descriptionSource ?descriptionSource . }}
  OPTIONAL {{ data:{species_id} ff:imageUrl ?imageUrl . }}
  OPTIONAL {{ data:{species_id} ff:imageSource ?imageSource . }}
}}
GROUP BY ?id ?scientificName ?indonesianName ?englishName
         ?kingdomLabel ?phylumLabel ?classLabel ?orderLabel ?familyLabel ?genusLabel
         ?categoryLabel ?sourceData ?description ?descriptionSource ?imageUrl ?imageSource
"""


def related_query(species_id: str) -> str:
    """Build a query for species sharing the same family or genus."""
    return f"""
{PREFIXES}

SELECT DISTINCT ?id ?indonesianName ?scientificName ?englishName
       ?kingdomLabel ?familyLabel ?genusLabel ?categoryLabel ?sourceData
       ?description ?imageUrl ?imageSource ?relation
WHERE {{
  data:{species_id} ff:hasFamily ?family ;
                    ff:hasGenus ?genus .
  ?species a ff:SpeciesEntry ;
           ff:entryId ?id ;
           ff:indonesianName ?indonesianName ;
           ff:scientificName ?scientificName ;
           ff:englishName ?englishName ;
           ff:sourceData ?sourceData ;
           ff:hasKingdom/rdfs:label ?kingdomLabel ;
           ff:hasFamily ?family ;
           ff:hasFamily/rdfs:label ?familyLabel ;
           ff:hasGenus/rdfs:label ?genusLabel ;
           ff:hasCategory/rdfs:label ?categoryLabel .
  OPTIONAL {{ ?species ff:description ?description . }}
  OPTIONAL {{ ?species ff:imageUrl ?imageUrl . }}
  OPTIONAL {{ ?species ff:imageSource ?imageSource . }}
  FILTER(?species != data:{species_id})
  BIND(IF(EXISTS {{ ?species ff:hasGenus ?genus }}, "Satu genus", "Satu family") AS ?relation)
}}
ORDER BY ?relation LCASE(STR(?indonesianName))
"""


def compare_query(species_a: str, species_b: str) -> str:
    """Build a taxonomy comparison query for two species."""
    return f"""
{PREFIXES}

SELECT ?level ?labelA ?labelB
WHERE {{
  VALUES (?level ?property) {{
    ("Kingdom" ff:hasKingdom)
    ("Phylum" ff:hasPhylum)
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
    """Build a query for graph visualization nodes and taxonomy edges."""
    species_filter = """
        ?species a ff:SpeciesEntry ;
                 ff:entryId ?id ;
                 ff:indonesianName ?indonesianName ;
                 ff:scientificName ?scientificName .
    """
    if species_id:
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

    return f"""
{PREFIXES}

SELECT DISTINCT ?id ?indonesianName ?scientificName
       ?kingdomLabel ?phylumLabel ?classLabel ?orderLabel ?familyLabel ?genusLabel ?categoryLabel
WHERE {{
  {species_filter}
  ?species ff:hasKingdom/rdfs:label ?kingdomLabel ;
           ff:hasPhylum/rdfs:label ?phylumLabel ;
           ff:hasTaxonomicClass/rdfs:label ?classLabel ;
           ff:hasOrder/rdfs:label ?orderLabel ;
           ff:hasFamily/rdfs:label ?familyLabel ;
           ff:hasGenus/rdfs:label ?genusLabel ;
           ff:hasCategory/rdfs:label ?categoryLabel .
}}
ORDER BY LCASE(STR(?indonesianName))
LIMIT 120
"""
