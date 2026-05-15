from __future__ import annotations

from csv_to_rdf import DEFAULT_CSV, DEFAULT_OUTPUT, convert_csv_to_rdf
from load_rdf_to_fuseki import main as load_rdf_to_fuseki


def main() -> None:
    convert_csv_to_rdf(DEFAULT_CSV, DEFAULT_OUTPUT)
    print(f"RDF Turtle generated: {DEFAULT_OUTPUT}")
    load_rdf_to_fuseki()


if __name__ == "__main__":
    main()

