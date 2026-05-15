from __future__ import annotations

import csv
import json
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
OUTPUT_CSV = BASE_DIR / "data" / "flora_fauna.csv"
VALIDATION_REPORT = BASE_DIR / "data" / "validation_report.csv"

GBIF_MATCH_URL = "https://api.gbif.org/v1/species/match"
GBIF_SPECIES_URL = "https://api.gbif.org/v1/species"
WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql"


FIELDNAMES = [
    "id",
    "nama_latin",
    "nama_indonesia",
    "nama_inggris",
    "kingdom",
    "kelas",
    "ordo",
    "family",
    "genus",
    "kategori",
    "habitat",
    "deskripsi",
    "sinonim_ilmiah",
    "status_endemik",
    "sumber_data",
]


FLORA = [
    ("Rafflesia arnoldii", "Rafflesia arnoldii", "Corpse lily", "Bunga parasit", "Hutan hujan Sumatra", "Endemik Indonesia"),
    ("Amorphophallus titanum", "Bunga bangkai raksasa", "Titan arum", "Bunga majemuk", "Hutan hujan Sumatra", "Endemik Indonesia"),
    ("Shorea leprosula", "Meranti merah", "Light red meranti", "Pohon", "Hutan dipterokarpa", "Tidak endemik"),
    ("Eusideroxylon zwageri", "Ulin", "Bornean ironwood", "Pohon", "Hutan Kalimantan dan Sumatra", "Tidak endemik"),
    ("Santalum album", "Cendana", "Sandalwood", "Pohon", "Hutan kering dan savana", "Tidak endemik"),
    ("Myristica fragrans", "Pala", "Nutmeg", "Pohon", "Hutan tropis Maluku", "Asli Indonesia Timur"),
    ("Metroxylon sagu", "Sagu", "Sago palm", "Palem", "Rawa dan lahan basah", "Tidak endemik"),
    ("Phalaenopsis amabilis", "Anggrek bulan", "Moon orchid", "Anggrek", "Hutan tropis lembap", "Tidak endemik"),
    ("Durio zibethinus", "Durian", "Durian", "Pohon buah", "Hutan tropis dataran rendah", "Tidak endemik"),
    ("Nepenthes gymnamphora", "Kantong semar", "Pitcher plant", "Tumbuhan karnivora", "Hutan pegunungan lembap", "Endemik Indonesia"),
    ("Mangifera indica", "Mangga", "Mango", "Pohon buah", "Kebun dan hutan tropis", "Tidak endemik"),
    ("Cocos nucifera", "Kelapa", "Coconut", "Palem", "Pesisir dan kebun tropis", "Tidak endemik"),
    ("Musa acuminata", "Pisang", "Wild banana", "Herba buah", "Hutan dan kebun tropis", "Tidak endemik"),
    ("Oryza sativa", "Padi", "Asian rice", "Tanaman pangan", "Sawah dan lahan basah", "Tidak endemik"),
    ("Coffea canephora", "Kopi robusta", "Robusta coffee", "Tanaman perkebunan", "Perkebunan tropis", "Tidak endemik"),
    ("Coffea arabica", "Kopi arabika", "Arabica coffee", "Tanaman perkebunan", "Perkebunan dataran tinggi", "Tidak endemik"),
    ("Theobroma cacao", "Kakao", "Cacao", "Pohon perkebunan", "Perkebunan tropis", "Tidak endemik"),
    ("Syzygium aromaticum", "Cengkih", "Clove", "Pohon rempah", "Kebun dan hutan tropis", "Asli Indonesia Timur"),
    ("Piper nigrum", "Lada", "Black pepper", "Tanaman rempah", "Perkebunan tropis", "Tidak endemik"),
    ("Cinnamomum burmannii", "Kayu manis", "Indonesian cinnamon", "Pohon rempah", "Hutan dan perkebunan", "Tidak endemik"),
    ("Aleurites moluccanus", "Kemiri", "Candlenut", "Pohon", "Hutan dan kebun tropis", "Tidak endemik"),
    ("Artocarpus heterophyllus", "Nangka", "Jackfruit", "Pohon buah", "Kebun dan hutan tropis", "Tidak endemik"),
    ("Artocarpus altilis", "Sukun", "Breadfruit", "Pohon buah", "Kebun tropis", "Tidak endemik"),
    ("Areca catechu", "Pinang", "Areca palm", "Palem", "Kebun dan hutan tropis", "Tidak endemik"),
    ("Nypa fruticans", "Nipah", "Nipa palm", "Palem mangrove", "Muara dan hutan mangrove", "Tidak endemik"),
    ("Pandanus tectorius", "Pandan laut", "Screw pine", "Pohon pesisir", "Pesisir tropis", "Tidak endemik"),
    ("Alstonia scholaris", "Pulai", "Blackboard tree", "Pohon", "Hutan tropis", "Tidak endemik"),
    ("Melaleuca cajuputi", "Kayu putih", "Cajuput tree", "Pohon aromatik", "Hutan rawa dan savana", "Tidak endemik"),
    ("Aquilaria malaccensis", "Gaharu", "Agarwood", "Pohon", "Hutan tropis", "Tidak endemik"),
    ("Casuarina equisetifolia", "Cemara laut", "Beach she-oak", "Pohon pesisir", "Pantai dan pesisir", "Tidak endemik"),
    ("Intsia bijuga", "Merbau", "Moluccan ironwood", "Pohon", "Hutan tropis dan pesisir", "Tidak endemik"),
    ("Ficus benjamina", "Beringin", "Weeping fig", "Pohon", "Hutan dan ruang terbuka tropis", "Tidak endemik"),
    ("Tectona grandis", "Jati", "Teak", "Pohon kayu", "Hutan musim dan kebun", "Tidak endemik"),
    ("Swietenia macrophylla", "Mahoni daun besar", "Big-leaf mahogany", "Pohon kayu", "Kebun dan hutan tanaman", "Tidak endemik"),
    ("Gnetum gnemon", "Melinjo", "Melinjo", "Pohon pangan", "Kebun dan hutan tropis", "Tidak endemik"),
    ("Parkia speciosa", "Petai", "Stink bean", "Pohon pangan", "Hutan dan kebun tropis", "Tidak endemik"),
    ("Archidendron pauciflorum", "Jengkol", "Dogfruit", "Pohon pangan", "Hutan dan kebun tropis", "Tidak endemik"),
    ("Etlingera elatior", "Kecombrang", "Torch ginger", "Herba rempah", "Hutan lembap dan kebun", "Tidak endemik"),
    ("Zingiber officinale", "Jahe", "Ginger", "Herba rempah", "Kebun tropis", "Tidak endemik"),
    ("Curcuma longa", "Kunyit", "Turmeric", "Herba rempah", "Kebun tropis", "Tidak endemik"),
    ("Alpinia galanga", "Lengkuas", "Greater galangal", "Herba rempah", "Kebun tropis", "Tidak endemik"),
    ("Cymbopogon citratus", "Serai", "Lemongrass", "Rumput rempah", "Kebun dan pekarangan", "Tidak endemik"),
    ("Pandanus amaryllifolius", "Pandan wangi", "Pandan", "Herba aromatik", "Kebun dan lahan basah", "Tidak endemik"),
    ("Averrhoa carambola", "Belimbing", "Star fruit", "Pohon buah", "Kebun tropis", "Tidak endemik"),
    ("Garcinia mangostana", "Manggis", "Mangosteen", "Pohon buah", "Hutan dan kebun tropis", "Tidak endemik"),
    ("Lansium domesticum", "Duku", "Langsat", "Pohon buah", "Hutan dan kebun tropis", "Tidak endemik"),
    ("Nephelium lappaceum", "Rambutan", "Rambutan", "Pohon buah", "Hutan dan kebun tropis", "Tidak endemik"),
    ("Salacca zalacca", "Salak", "Snake fruit", "Palem buah", "Kebun tropis", "Tidak endemik"),
    ("Rhizophora apiculata", "Bakau minyak", "Tall-stilt mangrove", "Mangrove", "Hutan mangrove", "Tidak endemik"),
    ("Terminalia catappa", "Ketapang", "Tropical almond", "Pohon pesisir", "Pantai dan hutan pesisir", "Tidak endemik"),
]


FAUNA = [
    ("Felis catus", "Kucing", "Domestic cat", "Mamalia", "Lingkungan domestik", "Tidak endemik"),
    ("Panthera tigris", "Harimau", "Tiger", "Mamalia", "Hutan tropis dan padang rumput", "Tidak endemik"),
    ("Pongo abelii", "Orangutan sumatra", "Sumatran orangutan", "Mamalia", "Hutan hujan Sumatra", "Endemik Indonesia"),
    ("Pongo pygmaeus", "Orangutan kalimantan", "Bornean orangutan", "Mamalia", "Hutan hujan Kalimantan", "Tidak endemik"),
    ("Varanus komodoensis", "Komodo", "Komodo dragon", "Reptil", "Savana dan hutan kering Nusa Tenggara", "Endemik Indonesia"),
    ("Leucopsar rothschildi", "Jalak bali", "Bali myna", "Burung", "Hutan musim Bali", "Endemik Indonesia"),
    ("Nisaetus bartelsi", "Elang jawa", "Javan hawk-eagle", "Burung", "Hutan pegunungan Jawa", "Endemik Indonesia"),
    ("Babyrousa celebensis", "Babirusa sulawesi", "Sulawesi babirusa", "Mamalia", "Hutan Sulawesi", "Endemik Indonesia"),
    ("Macrocephalon maleo", "Maleo", "Maleo", "Burung", "Hutan dan pantai berpasir Sulawesi", "Endemik Indonesia"),
    ("Elephas maximus", "Gajah sumatra", "Asian elephant", "Mamalia", "Hutan dataran rendah Sumatra", "Tidak endemik"),
    ("Rhinoceros sondaicus", "Badak jawa", "Javan rhinoceros", "Mamalia", "Hutan hujan dataran rendah", "Tidak endemik"),
    ("Dicerorhinus sumatrensis", "Badak sumatra", "Sumatran rhinoceros", "Mamalia", "Hutan hujan Sumatra dan Kalimantan", "Tidak endemik"),
    ("Nasalis larvatus", "Bekantan", "Proboscis monkey", "Mamalia", "Hutan mangrove dan rawa Kalimantan", "Tidak endemik"),
    ("Macaca nigra", "Yaki", "Celebes crested macaque", "Mamalia", "Hutan Sulawesi", "Endemik Indonesia"),
    ("Tarsius tarsier", "Tangkasi", "Spectral tarsier", "Mamalia", "Hutan Sulawesi", "Endemik Indonesia"),
    ("Bubalus depressicornis", "Anoa dataran rendah", "Lowland anoa", "Mamalia", "Hutan Sulawesi", "Endemik Indonesia"),
    ("Bubalus quarlesi", "Anoa pegunungan", "Mountain anoa", "Mamalia", "Hutan pegunungan Sulawesi", "Endemik Indonesia"),
    ("Sus celebensis", "Babi sulawesi", "Sulawesi warty pig", "Mamalia", "Hutan dan semak Sulawesi", "Endemik Indonesia"),
    ("Helarctos malayanus", "Beruang madu", "Sun bear", "Mamalia", "Hutan tropis Sumatra dan Kalimantan", "Tidak endemik"),
    ("Neofelis diardi", "Macan dahan sunda", "Sunda clouded leopard", "Mamalia", "Hutan Sumatra dan Kalimantan", "Tidak endemik"),
    ("Prionailurus bengalensis", "Kucing kuwuk", "Leopard cat", "Mamalia", "Hutan dan lahan terbuka", "Tidak endemik"),
    ("Cuon alpinus", "Ajag", "Dhole", "Mamalia", "Hutan dan padang rumput", "Tidak endemik"),
    ("Rusa timorensis", "Rusa timor", "Javan rusa", "Mamalia", "Hutan musim dan savana", "Tidak endemik"),
    ("Axis kuhlii", "Rusa bawean", "Bawean deer", "Mamalia", "Hutan Pulau Bawean", "Endemik Indonesia"),
    ("Bos javanicus", "Banteng", "Banteng", "Mamalia", "Hutan dan padang rumput", "Tidak endemik"),
    ("Manis javanica", "Trenggiling", "Sunda pangolin", "Mamalia", "Hutan tropis", "Tidak endemik"),
    ("Arctictis binturong", "Binturong", "Binturong", "Mamalia", "Hutan tropis", "Tidak endemik"),
    ("Ailurops ursinus", "Kuskus beruang sulawesi", "Sulawesi bear cuscus", "Mamalia", "Hutan Sulawesi", "Endemik Indonesia"),
    ("Spilocuscus maculatus", "Kuskus tutul", "Common spotted cuscus", "Mamalia", "Hutan Papua dan Maluku", "Tidak endemik"),
    ("Paradisaea apoda", "Cenderawasih besar", "Greater bird-of-paradise", "Burung", "Hutan Papua", "Tidak endemik"),
    ("Paradisaea minor", "Cenderawasih kecil", "Lesser bird-of-paradise", "Burung", "Hutan Papua", "Tidak endemik"),
    ("Cicinnurus regius", "Cenderawasih raja", "King bird-of-paradise", "Burung", "Hutan Papua", "Tidak endemik"),
    ("Cacatua sulphurea", "Kakatua kecil jambul kuning", "Yellow-crested cockatoo", "Burung", "Hutan dan savana", "Tidak endemik"),
    ("Probosciger aterrimus", "Kakatua raja", "Palm cockatoo", "Burung", "Hutan Papua", "Tidak endemik"),
    ("Lorius lory", "Nuri kepala hitam", "Black-capped lory", "Burung", "Hutan Papua", "Tidak endemik"),
    ("Eos bornea", "Nuri merah", "Red lory", "Burung", "Hutan Maluku", "Endemik Indonesia"),
    ("Gracula religiosa", "Tiong emas", "Common hill myna", "Burung", "Hutan tropis", "Tidak endemik"),
    ("Buceros rhinoceros", "Rangkong badak", "Rhinoceros hornbill", "Burung", "Hutan Sumatra dan Kalimantan", "Tidak endemik"),
    ("Rhinoplax vigil", "Rangkong gading", "Helmeted hornbill", "Burung", "Hutan Sumatra dan Kalimantan", "Tidak endemik"),
    ("Crocodylus porosus", "Buaya muara", "Saltwater crocodile", "Reptil", "Muara, sungai, dan pesisir", "Tidak endemik"),
    ("Crocodylus siamensis", "Buaya siam", "Siamese crocodile", "Reptil", "Sungai dan rawa", "Tidak endemik"),
    ("Chelonia mydas", "Penyu hijau", "Green sea turtle", "Reptil", "Laut tropis dan pantai peneluran", "Tidak endemik"),
    ("Eretmochelys imbricata", "Penyu sisik", "Hawksbill sea turtle", "Reptil", "Terumbu karang dan laut tropis", "Tidak endemik"),
    ("Malayopython reticulatus", "Sanca kembang", "Reticulated python", "Reptil", "Hutan dan lahan basah", "Tidak endemik"),
    ("Naja sputatrix", "Ular sendok jawa", "Javan spitting cobra", "Reptil", "Hutan, kebun, dan permukiman", "Tidak endemik"),
    ("Dugong dugon", "Duyung", "Dugong", "Mamalia laut", "Padang lamun dan perairan pesisir", "Tidak endemik"),
    ("Latimeria menadoensis", "Ikan raja laut", "Indonesian coelacanth", "Ikan", "Perairan laut dalam Sulawesi", "Endemik Indonesia"),
    ("Scleropages formosus", "Arwana asia", "Asian arowana", "Ikan", "Sungai dan rawa gambut", "Tidak endemik"),
    ("Ornithoptera croesus", "Kupu-kupu sayap burung Wallace", "Wallace's golden birdwing", "Serangga", "Hutan Maluku", "Endemik Indonesia"),
    ("Ornithoptera paradisea", "Kupu-kupu sayap burung surga", "Paradise birdwing", "Serangga", "Hutan Papua", "Tidak endemik"),
]


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-zA-Z0-9]+", "_", ascii_value.lower()).strip("_")


def fetch_json(url: str, params: dict[str, str] | None = None) -> dict:
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


def fetch_gbif_match(name: str) -> dict:
    match = fetch_json(GBIF_MATCH_URL, {"name": name, "rank": "SPECIES", "strict": "false"})
    key = match.get("acceptedUsageKey") or match.get("usageKey")
    if not key:
        raise RuntimeError(f"GBIF match not found: {name}")
    species = fetch_json(f"{GBIF_SPECIES_URL}/{key}")
    required = ["kingdom", "family", "genus", "canonicalName"]
    missing = [field for field in required if not species.get(field)]
    if missing:
        raise RuntimeError(f"GBIF taxonomy incomplete for {name}: {missing}")
    return species


def fetch_gbif_synonyms(key: int) -> str:
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


def fetch_wikidata(scientific_name: str) -> dict[str, str]:
    query = f"""
    SELECT ?item ?itemLabel ?itemLabelEn ?itemDescription ?rank ?taxonName ?taxonLabel WHERE {{
      ?item wdt:P225 {json.dumps(scientific_name)} .
      OPTIONAL {{ ?item rdfs:label ?itemLabel FILTER(LANG(?itemLabel) = "id") }}
      OPTIONAL {{ ?item rdfs:label ?itemLabelEn FILTER(LANG(?itemLabelEn) = "en") }}
      OPTIONAL {{ ?item schema:description ?itemDescription FILTER(LANG(?itemDescription) = "id") }}
      OPTIONAL {{
        ?item wdt:P171* ?taxon .
        ?taxon wdt:P105 ?rank .
        VALUES ?rank {{ wd:Q36732 wd:Q37517 wd:Q36602 wd:Q35409 wd:Q34740 }}
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
        "description": "",
        "kingdom": "",
        "class": "",
        "order": "",
        "family": "",
        "genus": "",
    }
    rank_map = {
        "http://www.wikidata.org/entity/Q36732": "kingdom",
        "http://www.wikidata.org/entity/Q37517": "class",
        "http://www.wikidata.org/entity/Q36602": "order",
        "http://www.wikidata.org/entity/Q35409": "family",
        "http://www.wikidata.org/entity/Q34740": "genus",
    }
    for row in bindings:
        result["label_id"] = result["label_id"] or row.get("itemLabel", {}).get("value", "")
        result["label_en"] = result["label_en"] or row.get("itemLabelEn", {}).get("value", "")
        result["description"] = result["description"] or row.get("itemDescription", {}).get("value", "")
        rank = row.get("rank", {}).get("value", "")
        field = rank_map.get(rank)
        if field and not result[field]:
            result[field] = row.get("taxonName", {}).get("value") or row.get("taxonLabel", {}).get("value", "")
    return result


def description_for(row: tuple[str, str, str, str, str, str], wikidata: dict[str, str], kingdom: str) -> str:
    scientific_name, nama_id, _english, category, habitat, status = row
    wd_description = wikidata.get("description", "")
    if wd_description and scientific_name.lower() not in wd_description.lower():
        return wd_description
    group = "flora" if kingdom == "Plantae" else "fauna"
    return f"{nama_id} adalah entri leksikon {group} Indonesia kategori {category} dengan habitat utama {habitat}. Status endemik: {status}."


def make_row(candidate: tuple[str, str, str, str, str, str]) -> tuple[dict[str, str], dict[str, str]]:
    scientific_name, nama_id, english, category, habitat, status = candidate
    gbif = fetch_gbif_match(scientific_name)
    canonical_name = gbif["canonicalName"]
    key = gbif["key"]
    wikidata = fetch_wikidata(canonical_name)
    synonyms = fetch_gbif_synonyms(key)

    taxonomy = {
        "kingdom": gbif.get("kingdom", ""),
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
        if not taxonomy["family"] and wikidata.get("family"):
            taxonomy["family"] = wikidata["family"]
        if not taxonomy["genus"] and wikidata.get("genus"):
            taxonomy["genus"] = wikidata["genus"]
    missing = [field for field, value in taxonomy.items() if not value]
    if missing:
        raise RuntimeError(f"Taxonomy incomplete after GBIF/Wikidata validation for {scientific_name}: {missing}")

    nama_indonesia = wikidata.get("label_id") or nama_id
    if nama_indonesia.lower() == canonical_name.lower():
        nama_indonesia = nama_id

    nama_inggris = wikidata.get("label_en") or english
    if nama_inggris.lower() == canonical_name.lower():
        nama_inggris = english

    gbif_url = f"https://www.gbif.org/species/{key}"
    source_parts = [f"GBIF: {gbif_url}"]
    if wikidata.get("url"):
        source_parts.append(f"Wikidata: {wikidata['url']}")

    output = {
        "id": slugify(nama_id),
        "nama_latin": canonical_name,
        "nama_indonesia": nama_indonesia,
        "nama_inggris": nama_inggris,
        "kingdom": taxonomy["kingdom"],
        "kelas": taxonomy["class"],
        "ordo": taxonomy["order"],
        "family": taxonomy["family"],
        "genus": taxonomy["genus"],
        "kategori": category,
        "habitat": habitat,
        "deskripsi": description_for(candidate, wikidata, gbif["kingdom"]),
        "sinonim_ilmiah": synonyms,
        "status_endemik": status,
        "sumber_data": "; ".join(source_parts),
    }
    report = {
        "input_scientific_name": scientific_name,
        "accepted_scientific_name": canonical_name,
        "gbif_key": str(key),
        "gbif_url": gbif_url,
        "wikidata_url": wikidata.get("url", ""),
        "taxonomic_status": gbif.get("taxonomicStatus", ""),
        "rank": gbif.get("rank", ""),
    }
    return output, report


def write_csv(path: Path, rows: list[dict[str, str]], fieldnames: list[str]) -> None:
    with path.open("w", encoding="utf-8", newline="") as output:
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    rows: list[dict[str, str]] = []
    reports: list[dict[str, str]] = []
    candidates = [*FLORA, *FAUNA]
    for index, candidate in enumerate(candidates, start=1):
        row, report = make_row(candidate)
        rows.append(row)
        reports.append(report)
        print(f"[{index:03d}/{len(candidates)}] validated {row['nama_latin']} -> {row['kingdom']} {row['family']}")
        time.sleep(0.15)

    flora_count = sum(1 for row in rows if row["kingdom"] == "Plantae")
    fauna_count = sum(1 for row in rows if row["kingdom"] == "Animalia")
    if flora_count != 50 or fauna_count != 50:
        raise RuntimeError(f"Expected 50 Plantae and 50 Animalia, got {flora_count} and {fauna_count}")

    write_csv(OUTPUT_CSV, rows, FIELDNAMES)
    write_csv(
        VALIDATION_REPORT,
        reports,
        ["input_scientific_name", "accepted_scientific_name", "gbif_key", "gbif_url", "wikidata_url", "taxonomic_status", "rank"],
    )
    print(f"Wrote {len(rows)} validated rows to {OUTPUT_CSV}")
    print(f"Wrote validation report to {VALIDATION_REPORT}")


if __name__ == "__main__":
    main()
