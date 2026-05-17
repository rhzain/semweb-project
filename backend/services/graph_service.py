from __future__ import annotations

from typing import Any


def build_graph_payload(rows: list[dict[str, str]], focus_id: str = "") -> dict[str, Any]:
    """Transform SPARQL graph rows into Cytoscape-compatible nodes and edges."""
    nodes: dict[str, dict[str, Any]] = {}
    edges: list[dict[str, str]] = []
    edge_ids: set[str] = set()

    def add_node(node_id: str, label: str, node_type: str, **extra: Any) -> None:
        """Insert a graph node only once."""
        nodes.setdefault(node_id, {"id": node_id, "label": label, "type": node_type, **extra})

    def add_edge(source: str, target: str, label: str) -> None:
        """Insert a graph edge only once."""
        edge_id = f"{source}->{target}:{label}"
        if edge_id not in edge_ids:
            edges.append({"id": edge_id, "source": source, "target": target, "label": label})
            edge_ids.add(edge_id)

    taxonomy_fields = [
        ("kingdomLabel", "Kingdom", "has kingdom"),
        ("phylumLabel", "Phylum", "has phylum"),
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
