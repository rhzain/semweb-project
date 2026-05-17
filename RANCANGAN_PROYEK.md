# Rancangan Proyek Akhir Semantic Web

## 1. Judul Proyek Akademik

**Aplikasi Web Leksikon Nama Ilmiah Flora dan Fauna Indonesia Berbasis Knowledge Graph, RDF, Ontologi, dan SPARQL Endpoint**

Alternatif judul yang lebih ringkas:

**Leksikon Semantik Nama Ilmiah Flora dan Fauna Indonesia Menggunakan RDF, Ontologi, Knowledge Graph, dan SPARQL**

## 2. Deskripsi Singkat Proyek

Proyek ini membangun aplikasi web pencarian leksikon flora dan fauna Indonesia. Aplikasi memungkinkan pengguna mencari spesies berdasarkan nama ilmiah, nama lokal Indonesia, nama Inggris, sinonim ilmiah, phylum, family, genus, kategori, dan klasifikasi taksonomi. Data awal disusun dalam CSV, dikonversi menjadi RDF Turtle, dimodelkan menggunakan ontologi, dimuat ke Apache Jena Fuseki sebagai SPARQL endpoint, lalu diakses oleh frontend React melalui backend API Flask.

Fokus utama proyek bukan membuat database biologi biasa, melainkan membuat **leksikon semantik** yang menghubungkan variasi nama, sinonim ilmiah, istilah lokal, istilah Inggris, dan relasi taksonomi dalam bentuk **subject-predicate-object** pada knowledge graph.

## 3. Latar Belakang Singkat

Nama flora dan fauna memiliki banyak variasi: satu spesies dapat memiliki nama ilmiah, nama lokal Indonesia, nama Inggris, sinonim ilmiah, serta posisi taksonomi seperti kingdom, phylum, kelas, ordo, family, dan genus. Pada sistem pencarian biasa, hubungan antaristilah sering hanya disimpan sebagai kolom tabel, sehingga relasi semantiknya tidak eksplisit.

Semantic Web menyediakan pendekatan yang lebih kaya melalui RDF, ontologi, dan SPARQL. Dengan RDF, setiap data direpresentasikan sebagai triple. Dengan ontologi, konsep leksikon dan taksonomi dapat didefinisikan secara eksplisit. Dengan SPARQL endpoint, data dapat dicari dan dihubungkan melalui query semantik. Oleh karena itu, proyek ini cocok sebagai studi kasus penerapan Semantic Web pada leksikon nama ilmiah flora dan fauna Indonesia.

## 4. Rumusan Masalah

1. Bagaimana merepresentasikan data nama ilmiah, nama lokal, nama Inggris, sinonim ilmiah, dan taksonomi flora-fauna Indonesia dalam bentuk RDF triple?
2. Bagaimana merancang ontologi yang menggambarkan konsep leksikon dan klasifikasi taksonomi?
3. Bagaimana menyediakan SPARQL endpoint untuk mengambil data leksikon berbasis RDF?
4. Bagaimana membangun website pencarian yang dapat mengakses data RDF melalui SPARQL?
5. Bagaimana menampilkan hubungan semantik antarspesies, seperti kesamaan kingdom, phylum, kelas, ordo, family, dan genus?

## 5. Tujuan Proyek

1. Membuat dataset leksikon flora dan fauna Indonesia dalam format CSV.
2. Mengonversi data CSV menjadi RDF Turtle secara otomatis menggunakan Python.
3. Membuat ontologi untuk konsep leksikon nama spesies dan relasi taksonomi.
4. Menjalankan Apache Jena Fuseki sebagai SPARQL endpoint.
5. Membuat aplikasi web React dan backend Flask untuk pencarian dan detail spesies.
6. Menampilkan relasi knowledge graph, seperti spesies satu family, satu genus, dan perbandingan hubungan dua spesies.

## 6. Batasan Proyek

1. Dataset berisi 100 data: 50 flora dan 50 fauna Indonesia.
2. Data taksonomi divalidasi dari sumber terbuka, terutama GBIF Species API/GBIF Backbone Taxonomy dan Wikidata.
3. Dataset dibuat untuk kebutuhan proyek leksikon Semantic Web, bukan sebagai rujukan taksonomi biologis final.
4. Sistem berfokus pada pencarian leksikon nama dan hubungan taksonomi dasar.
5. Sistem belum menerapkan reasoning OWL kompleks.
6. Relasi kedekatan spesies dihitung dari kesamaan taksonomi: kingdom, phylum, kelas, ordo, family, dan genus.

## 7. Alasan Proyek Ini Termasuk Data Linguistik/Leksikon

Proyek ini bukan sekadar database biologi karena objek utama yang dicari dan dimodelkan adalah **entri leksikon nama spesies**. Setiap spesies direpresentasikan sebagai entri yang memiliki:

1. Nama ilmiah atau nama Latin.
2. Nama lokal Indonesia.
3. Nama Inggris.
4. Sinonim ilmiah.
5. Label dan istilah taksonomi.
6. Deskripsi singkat sebagai teks leksikal.
7. Relasi antaristilah dan antartakson dalam knowledge graph.

Dengan kata lain, sistem ini memperlakukan nama spesies sebagai data bahasa dan istilah, lalu menghubungkannya dengan konsep taksonomi. RDF triple membuat relasi seperti `harimau memiliki nama ilmiah Panthera tigris`, `harimau berada dalam family Felidae`, dan `kucing berada dalam family Felidae` dapat dicari secara semantik menggunakan SPARQL.

## 8. Struktur Data CSV yang Disarankan

File: `data.csv/processed/species_enriched.csv`

Kolom minimal:

```csv
id,nama_latin,nama_indonesia,nama_inggris,kingdom,phylum,kelas,ordo,family,genus,kategori,habitat,deskripsi,sinonim_ilmiah,status_endemik,sumber_data
```

Penjelasan:

| Kolom | Fungsi |
|---|---|
| `id` | Identifier unik untuk URI RDF, misalnya `kucing` atau `rafflesia_arnoldii`. |
| `nama_latin` | Nama ilmiah utama. |
| `nama_indonesia` | Nama lokal atau nama umum bahasa Indonesia. |
| `nama_inggris` | Nama umum bahasa Inggris. |
| `kingdom` | Kingdom taksonomi, misalnya `Plantae` atau `Animalia`. |
| `phylum` | Phylum taksonomi, misalnya `Tracheophyta`, `Chordata`, atau `Arthropoda`. |
| `kelas` | Kelas taksonomi. |
| `ordo` | Ordo taksonomi. |
| `family` | Family taksonomi. |
| `genus` | Genus taksonomi. |
| `kategori` | Kategori leksikon, misalnya `Mamalia`, `Burung`, `Pohon`, `Anggrek`. |
| `habitat` | Habitat umum. |
| `deskripsi` | Deskripsi singkat untuk halaman detail. |
| `sinonim_ilmiah` | Sinonim ilmiah, dapat dipisahkan dengan `|` jika lebih dari satu. |
| `status_endemik` | Status endemik, misalnya `Endemik Indonesia` atau `Tidak endemik`. |
| `sumber_data` | Rujukan data. |

## 9. Dataset 100 Data Awal CSV

Dataset lengkap tersedia di file `data.csv/processed/species_enriched.csv`. Dataset berisi 100 entri:

1. 50 flora Indonesia dengan kingdom `Plantae`.
2. 50 fauna Indonesia dengan kingdom `Animalia`.

Setiap entri memiliki URL sumber pada kolom `sumber_data`. Data taksonomi seperti `kingdom`, `phylum`, `kelas`, `ordo`, `family`, dan `genus` diambil/validasi dari GBIF dan diperkaya dengan Wikidata bila tersedia. Nama umum diambil dari Wikidata label dan GBIF `vernacularNames`; deskripsi dari Wikidata description dan GBIF `descriptions`; habitat dari Wikidata `P2974` dan GBIF `speciesProfiles`; status endemik dari Wikidata `P183` bila tersedia. Raw output API disimpan di `data.csv/raw/gbif_results.csv` dan `data.csv/raw/wikidata_results.csv`.

Daftar pencarian API dipisahkan di `data.csv/seed/species_seed.csv` dan berisi ID, nama yang dicari, kingdom hint, serta keterangan sumber seed. Seed ini disusun manual untuk menentukan 50 flora dan 50 fauna target proyek, lalu setiap nama ilmiah divalidasi dan diperkaya melalui GBIF/Wikidata. Field yang tidak tersedia dari API ditulis sebagai `Tidak tersedia dari API`, tanpa data lokal pengganti.

Beberapa field seperti habitat dan status endemik tidak selalu tersedia secara terstruktur di GBIF/Wikidata untuk semua spesies. Pipeline tidak mengarang nilai untuk menutup kekosongan tersebut; kelengkapan 100% hanya bisa dicapai jika proyek menambah sumber terstruktur lain atau melakukan kurasi manual yang sumbernya dicatat jelas.

Contoh entri flora:

1. Rafflesia arnoldi
2. Amorphophallus titanum
3. Shorea leprosula
4. Eusideroxylon zwageri
5. Santalum album

Contoh entri fauna:

1. Felis catus
2. Panthera tigris
3. Pongo abelii
4. Varanus komodoensis
5. Leucopsar rothschildi

## 10. Desain Ontologi

Namespace:

```turtle
@prefix ff: <http://example.org/flora-fauna/ontology#> .
@prefix data: <http://example.org/flora-fauna/resource/> .
```

### Class

| Class | Fungsi |
|---|---|
| `ff:LexicalEntry` | Entri leksikon umum. |
| `ff:SpeciesEntry` | Entri leksikon untuk spesies. |
| `ff:FloraEntry` | Entri spesies flora. |
| `ff:FaunaEntry` | Entri spesies fauna. |
| `ff:Taxon` | Konsep taksonomi umum. |
| `ff:Kingdom` | Kingdom. |
| `ff:Phylum` | Phylum. |
| `ff:TaxonomicClass` | Kelas taksonomi. |
| `ff:Order` | Ordo. |
| `ff:Family` | Family. |
| `ff:Genus` | Genus. |
| `ff:Category` | Kategori leksikon. |
| `ff:Habitat` | Habitat umum. |

### Object Property

| Object Property | Domain | Range |
|---|---|---|
| `ff:hasKingdom` | `ff:SpeciesEntry` | `ff:Kingdom` |
| `ff:hasPhylum` | `ff:SpeciesEntry` | `ff:Phylum` |
| `ff:hasTaxonomicClass` | `ff:SpeciesEntry` | `ff:TaxonomicClass` |
| `ff:hasOrder` | `ff:SpeciesEntry` | `ff:Order` |
| `ff:hasFamily` | `ff:SpeciesEntry` | `ff:Family` |
| `ff:hasGenus` | `ff:SpeciesEntry` | `ff:Genus` |
| `ff:hasCategory` | `ff:SpeciesEntry` | `ff:Category` |
| `ff:hasHabitat` | `ff:SpeciesEntry` | `ff:Habitat` |
| `ff:taxonomicallyRelatedTo` | `ff:SpeciesEntry` | `ff:SpeciesEntry` |
| `ff:sameKingdomAs` | `ff:SpeciesEntry` | `ff:SpeciesEntry` |
| `ff:samePhylumAs` | `ff:SpeciesEntry` | `ff:SpeciesEntry` |
| `ff:sameClassAs` | `ff:SpeciesEntry` | `ff:SpeciesEntry` |
| `ff:sameOrderAs` | `ff:SpeciesEntry` | `ff:SpeciesEntry` |
| `ff:sameFamilyAs` | `ff:SpeciesEntry` | `ff:SpeciesEntry` |
| `ff:sameGenusAs` | `ff:SpeciesEntry` | `ff:SpeciesEntry` |

### Datatype Property

| Datatype Property | Fungsi |
|---|---|
| `ff:entryId` | ID entri. |
| `ff:scientificName` | Nama ilmiah. |
| `ff:indonesianName` | Nama lokal Indonesia. |
| `ff:englishName` | Nama Inggris. |
| `ff:scientificSynonym` | Sinonim ilmiah. |
| `ff:description` | Deskripsi singkat. |
| `ff:endemismStatus` | Status endemik. |
| `ff:sourceData` | Sumber data. |
| `ff:searchText` | Teks gabungan untuk pencarian. |

## 11. Contoh RDF Turtle Beberapa Data

```turtle
data:kucing a ff:SpeciesEntry, ff:FaunaEntry ;
    rdfs:label "Kucing (Felis catus)" ;
    ff:entryId "kucing" ;
    ff:scientificName "Felis catus" ;
    ff:indonesianName "Kucing" ;
    ff:englishName "Domestic cat" ;
    ff:scientificSynonym "Felis silvestris catus" ;
    ff:hasKingdom data:kingdom_animalia ;
    ff:hasPhylum data:phylum_chordata ;
    ff:hasTaxonomicClass data:class_mammalia ;
    ff:hasOrder data:order_carnivora ;
    ff:hasFamily data:family_felidae ;
    ff:hasGenus data:genus_felis .

data:harimau a ff:SpeciesEntry, ff:FaunaEntry ;
    rdfs:label "Harimau (Panthera tigris)" ;
    ff:entryId "harimau" ;
    ff:scientificName "Panthera tigris" ;
    ff:indonesianName "Harimau" ;
    ff:englishName "Tiger" ;
    ff:scientificSynonym "Felis tigris" ;
    ff:hasKingdom data:kingdom_animalia ;
    ff:hasPhylum data:phylum_chordata ;
    ff:hasTaxonomicClass data:class_mammalia ;
    ff:hasOrder data:order_carnivora ;
    ff:hasFamily data:family_felidae ;
    ff:hasGenus data:genus_panthera .
```

## 12. Script Pipeline Python

Script pipeline tersedia di folder `python_script/` dengan pembagian tugas berikut:

| File | Fungsi |
|---|---|
| `scrape/main.py` | Entry point untuk membangun raw API CSV dan `data.csv/processed/species_enriched.csv`. |
| `scrape/api_clients.py` | Fungsi pengambilan data dari GBIF dan Wikidata. |
| `scrape/build_dataset.py` | Logic penggabungan search terms dan API enrichment. |
| `rdf/main.py` | Entry point konversi `data.csv/processed/species_enriched.csv` menjadi `rdf/flora_fauna.ttl`. |
| `rdf/converter.py` | Logic RDFLib untuk membangun triple RDF. |
| `load/main.py` | Entry point upload ontologi dan RDF ke Apache Jena Fuseki. |
| `refresh/main.py` | Entry point regenerate RDF lalu upload ulang ke Fuseki. |

Contoh menjalankan:

```bash
python python_script/rdf/main.py
```

Jika memakai Docker:

```bash
docker compose run --rm --no-deps web python python_script/scrape/main.py
docker compose run --rm --no-deps web python python_script/rdf/main.py
docker compose run --rm rdf-loader
```

## 13. File `ontology.ttl`

File ontologi tersedia di `ontology/ontology.ttl`. File ini mendefinisikan class, object property, dan datatype property untuk leksikon flora-fauna.

## 14. File `flora_fauna.ttl`

File RDF hasil contoh tersedia di `rdf/flora_fauna.ttl`. File ini dapat dihasilkan ulang dari CSV menggunakan script konversi.

## 15. Setup Seluruh Aplikasi Menggunakan Docker Compose

Docker Compose digunakan untuk membungkus seluruh aplikasi, bukan hanya Apache Jena Fuseki. Service yang digunakan:

1. `fuseki`: Apache Jena Fuseki sebagai RDF store dan SPARQL endpoint.
2. `rdf-loader`: service sekali jalan untuk memuat `ontology.ttl` dan `flora_fauna.ttl` ke Fuseki.
3. `web`: aplikasi Flask API yang menyajikan hasil build React untuk website pencarian.

File `docker-compose.yml`:

```yaml
services:
  fuseki:
    image: stain/jena-fuseki:latest
    container_name: flora-fauna-fuseki
    ports:
      - "3030:3030"
    environment:
      ADMIN_PASSWORD: admin
      FUSEKI_DATASET_1: flora-fauna
    volumes:
      - fuseki-data:/fuseki

  rdf-loader:
    build: .
    command: python python_script/refresh/main.py
    environment:
      FUSEKI_DATA_URL: http://fuseki:3030/flora-fauna/data?default
      FUSEKI_USER: admin
      FUSEKI_PASSWORD: admin
    volumes:
      - ./data.csv:/app/data.csv
      - ./rdf:/app/rdf
      - ./ontology:/app/ontology:ro
      - ./python_script:/app/python_script:ro
    depends_on:
      fuseki:
        condition: service_started
    restart: "no"

  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      SPARQL_ENDPOINT: http://fuseki:3030/flora-fauna/sparql
      PORT: 5000
      FLASK_DEBUG: "false"
      GEMINI_API_KEY: ${GEMINI_API_KEY:-}
      GEMINI_BASE_URL: ${GEMINI_BASE_URL:-https://generativelanguage.googleapis.com/v1beta}
      GEMINI_MODEL: ${GEMINI_MODEL:-gemini-2.5-flash}
    volumes:
      - ./data.csv:/app/data.csv
      - ./rdf:/app/rdf
      - ./ontology:/app/ontology:ro
      - ./python_script:/app/python_script:ro
    depends_on:
      rdf-loader:
        condition: service_completed_successfully

volumes:
  fuseki-data:
```

Jalankan:

```bash
docker compose up --build
```

## 16. Cara Upload/Load RDF ke Jena Fuseki

Pada mode Docker Compose penuh, RDF dimuat otomatis oleh service `rdf-loader`. Service ini menjalankan `python_script/refresh/main.py`, menggenerate `rdf/flora_fauna.ttl` dari `data.csv/processed/species_enriched.csv`, menggabungkan `ontology/ontology.ttl` dan `rdf/flora_fauna.ttl`, lalu mengirimkannya ke Fuseki melalui Graph Store Protocol.

Cara manual melalui UI tetap dapat digunakan:

1. Buka `http://localhost:3030`.
2. Login dengan username `admin` dan password `admin`.
3. Pilih dataset `flora-fauna`.
4. Masuk ke menu upload data.
5. Upload:
   - `ontology/ontology.ttl`
   - `rdf/flora_fauna.ttl`

Cara manual melalui curl:

```bash
curl -u admin:admin -X POST \
  -H "Content-Type: text/turtle" \
  --data-binary "@ontology/ontology.ttl" \
  "http://localhost:3030/flora-fauna/data?default"

curl -u admin:admin -X POST \
  -H "Content-Type: text/turtle" \
  --data-binary "@rdf/flora_fauna.ttl" \
  "http://localhost:3030/flora-fauna/data?default"
```

## 17. Contoh SPARQL Endpoint

```text
http://localhost:3030/flora-fauna/sparql
```

Endpoint ini digunakan oleh aplikasi Flask melalui library `SPARQLWrapper`.

## 18. Contoh Query SPARQL

Prefix:

```sparql
PREFIX ff: <http://example.org/flora-fauna/ontology#>
PREFIX data: <http://example.org/flora-fauna/resource/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
```

### Cari berdasarkan nama Indonesia

```sparql
SELECT ?species ?namaIndonesia ?namaLatin ?namaInggris
WHERE {
  ?species a ff:SpeciesEntry ;
           ff:indonesianName ?namaIndonesia ;
           ff:scientificName ?namaLatin ;
           ff:englishName ?namaInggris .
  FILTER(CONTAINS(LCASE(?namaIndonesia), LCASE("kucing")))
}
```

### Cari berdasarkan nama Latin

```sparql
SELECT ?species ?namaIndonesia ?namaLatin
WHERE {
  ?species a ff:SpeciesEntry ;
           ff:indonesianName ?namaIndonesia ;
           ff:scientificName ?namaLatin .
  FILTER(CONTAINS(LCASE(?namaLatin), LCASE("Panthera")))
}
```

### Cari berdasarkan nama Inggris

```sparql
SELECT ?species ?namaIndonesia ?namaInggris
WHERE {
  ?species a ff:SpeciesEntry ;
           ff:indonesianName ?namaIndonesia ;
           ff:englishName ?namaInggris .
  FILTER(CONTAINS(LCASE(?namaInggris), LCASE("tiger")))
}
```

### Cari berdasarkan family

```sparql
SELECT ?species ?namaIndonesia ?namaLatin ?familyLabel
WHERE {
  ?species a ff:SpeciesEntry ;
           ff:indonesianName ?namaIndonesia ;
           ff:scientificName ?namaLatin ;
           ff:hasFamily/rdfs:label ?familyLabel .
  FILTER(LCASE(?familyLabel) = LCASE("Felidae"))
}
```

### Cari berdasarkan genus

```sparql
SELECT ?species ?namaIndonesia ?namaLatin ?genusLabel
WHERE {
  ?species a ff:SpeciesEntry ;
           ff:indonesianName ?namaIndonesia ;
           ff:scientificName ?namaLatin ;
           ff:hasGenus/rdfs:label ?genusLabel .
  FILTER(LCASE(?genusLabel) = LCASE("Panthera"))
}
```

### Cari berdasarkan kategori

```sparql
SELECT ?species ?namaIndonesia ?namaLatin ?kategori
WHERE {
  ?species a ff:SpeciesEntry ;
           ff:indonesianName ?namaIndonesia ;
           ff:scientificName ?namaLatin ;
           ff:hasCategory/rdfs:label ?kategori .
  FILTER(LCASE(?kategori) = LCASE("Mamalia"))
}
```

### Tampilkan spesies satu family

```sparql
SELECT ?namaIndonesia ?namaLatin ?familyLabel
WHERE {
  data:kucing ff:hasFamily ?family .
  ?species a ff:SpeciesEntry ;
           ff:hasFamily ?family ;
           ff:indonesianName ?namaIndonesia ;
           ff:scientificName ?namaLatin .
  ?family rdfs:label ?familyLabel .
  FILTER(?species != data:kucing)
}
```

### Tampilkan spesies satu genus

```sparql
SELECT ?namaIndonesia ?namaLatin ?genusLabel
WHERE {
  data:kucing ff:hasGenus ?genus .
  ?species a ff:SpeciesEntry ;
           ff:hasGenus ?genus ;
           ff:indonesianName ?namaIndonesia ;
           ff:scientificName ?namaLatin .
  ?genus rdfs:label ?genusLabel .
  FILTER(?species != data:kucing)
}
```

### Bandingkan hubungan dua spesies

```sparql
SELECT ?level ?labelA ?labelB
WHERE {
  VALUES (?level ?property) {
    ("Kingdom" ff:hasKingdom)
    ("Phylum" ff:hasPhylum)
    ("Kelas" ff:hasTaxonomicClass)
    ("Ordo" ff:hasOrder)
    ("Family" ff:hasFamily)
    ("Genus" ff:hasGenus)
  }
  data:kucing ?property ?taxonA .
  data:harimau ?property ?taxonB .
  ?taxonA rdfs:label ?labelA .
  ?taxonB rdfs:label ?labelB .
}
```

## 19. Rancangan Fitur Website

1. Search bar untuk mencari nama Indonesia, nama Latin, nama Inggris, sinonim ilmiah, phylum, family, genus, kategori, dan deskripsi.
2. Halaman katalog untuk menampilkan semua data flora-fauna yang sudah dimuat ke RDF.
3. Filter kingdom: semua, Plantae, Animalia.
4. Filter kategori: Mamalia, Burung, Reptil, Pohon, Palem, Anggrek, dan lainnya.
5. Halaman hasil pencarian berisi nama Indonesia, nama Latin, nama Inggris, kingdom, phylum, family, genus, kategori, dan deskripsi ringkas.
6. Halaman detail spesies berisi seluruh data leksikon dan taksonomi.
7. Relasi spesies terkait: satu genus dan satu family.
8. Fitur bandingkan hubungan antarspesies.
9. Visualisasi knowledge graph untuk node spesies dan takson.
10. AI Explanation Assistant berbasis Gemini untuk menjelaskan hasil SPARQL pada halaman detail dan compare.
11. Tampilan query SPARQL yang digunakan agar aspek Semantic Web terlihat saat presentasi.

## 20. Struktur Folder Proyek

```text
flora-fauna-semantic-web/
|-- backend/
|   |-- app.py
|   |-- config.py
|   |-- queries.py
|   |-- sparql_client.py
|   |-- routes/
|   `-- services/
|-- data.csv/
|   |-- seed/
|   |   `-- species_seed.csv
|   |-- raw/
|   |   |-- gbif_results.csv
|   |   `-- wikidata_results.csv
|   `-- processed/
|       `-- species_enriched.csv
|-- rdf/
|   `-- flora_fauna.ttl
|-- ontology/
|   `-- ontology.ttl
|-- python_script/
|   |-- common/
|   |-- scrape/
|   |   |-- main.py
|   |   |-- api_clients.py
|   |   `-- build_dataset.py
|   |-- rdf/
|   |   |-- main.py
|   |   `-- converter.py
|   |-- load/
|   |   |-- main.py
|   |   `-- fuseki_loader.py
|   `-- refresh/
|       `-- main.py
|-- frontend/
|   |-- package.json
|   |-- index.html
|   |-- src/
|   `-- dist/
|-- Dockerfile
|-- docker-compose.yml
|-- requirements.txt
|-- README.md
`-- RANCANGAN_PROYEK.md
```
## 21. File `requirements.txt`

```text
Flask
SPARQLWrapper
rdflib
requests
```

## 22. Kode Flask `backend/app.py`

Entry point Flask tersedia di `backend/app.py`. Route API berada di `backend/routes/`, service pengolahan data berada di `backend/services/`, dan query SPARQL berada di `backend/queries.py`. Aplikasi mengirim query ke:

```text
http://localhost:3030/flora-fauna/sparql
```

Route utama:

| Route | Fungsi |
|---|---|
| `/`, `/data`, `/species/<id>`, `/compare`, `/graph` | Route frontend React yang disajikan oleh Flask. |
| `/api/species` | API pencarian dan katalog spesies. |
| `/api/species/<id>` | API detail spesies dan relasi satu family/satu genus. |
| `/api/compare` | API perbandingan hubungan dua spesies. |
| `/api/graph` | API node dan edge untuk visualisasi knowledge graph. |
| `/api/ai/explain/species/<id>` | Membuat penjelasan AI dari hasil SPARQL detail spesies. |
| `/api/ai/explain/compare` | Membuat penjelasan AI dari hasil SPARQL perbandingan spesies. |

## 23. Frontend React

Frontend tersedia di folder `frontend/`. Komponen utama berada di `frontend/src/App.jsx`, sedangkan style utama berada di `frontend/src/styles.css`.

Halaman utama:

1. `/` untuk pencarian cepat.
2. `/data` untuk katalog semua data.
3. `/species/:id` untuk detail spesies.
4. `/compare` untuk membandingkan dua spesies.
5. `/graph` untuk visualisasi knowledge graph.
6. Tombol `Jelaskan dengan AI` pada halaman detail spesies.
7. Tombol `Jelaskan Hubungan dengan AI` pada halaman compare.

## 24. CSS Frontend

CSS tersedia di `frontend/src/styles.css`. Desain dibuat clean, akademik, dan modern tanpa membuat UI terlalu ramai.

## Catatan Frontend

Frontend menggunakan React + Vite agar tampilan lebih modern, clean, dan mudah diperluas. Flask tetap digunakan sebagai backend API untuk mengirim SPARQL query ke Fuseki. Pembagian ini membuat arsitektur lebih jelas:

```text
React UI
-> Flask API
-> SPARQLWrapper
-> Apache Jena Fuseki
-> RDF Knowledge Graph
```

Fitur visualisasi knowledge graph menggunakan Cytoscape.js. Node merepresentasikan spesies dan takson, sedangkan edge merepresentasikan RDF property seperti `hasFamily`, `hasGenus`, dan `hasCategory`.

## AI Explanation Assistant Berbasis Gemini

Fitur LLM bersifat opsional dan diberi nama **AI Explanation Assistant**. Fitur ini tidak menggantikan RDF, ontologi, SPARQL endpoint, atau website pencarian. Data utama tetap berasal dari RDF knowledge graph yang di-query melalui Apache Jena Fuseki. Gemini hanya digunakan sebagai lapisan penjelas hasil SPARQL.

Alur kerja:

```text
User membuka detail spesies atau compare
-> Flask menjalankan query SPARQL ke Fuseki
-> hasil SPARQL dikonversi menjadi konteks JSON
-> Gemini menerima konteks JSON
-> Gemini membuat penjelasan natural dalam bahasa Indonesia
```

Tombol yang tersedia:

1. `Jelaskan dengan AI` pada halaman detail spesies.
2. `Jelaskan Hubungan dengan AI` pada halaman compare.

Prompt template:

```text
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
```

Contoh output AI untuk kucing dan harimau:

```text
Berdasarkan hasil SPARQL, Kucing (Felis catus) dan Harimau (Panthera tigris) sama-sama berada pada kingdom Animalia, phylum Chordata, kelas Mammalia, ordo Carnivora, dan family Felidae. Keduanya berbeda genus, yaitu Felis dan Panthera. Kesimpulannya, hubungan keduanya dekat karena berada dalam family yang sama, tetapi tidak sangat dekat karena genus berbeda.
```

Bagian ini dapat dijelaskan sebagai bentuk sederhana **Knowledge Graph-based RAG**: RDF/SPARQL menjadi retrieval layer yang menyediakan fakta terstruktur, sedangkan Gemini menjadi natural language explanation layer. LLM tidak dipakai untuk membuat dataset utama.

## 25. Instruksi Menjalankan Proyek dari Awal

1. Masuk ke folder proyek:

```bash
cd flora-fauna-semantic-web
```

2. Jalankan seluruh sistem dengan Docker Compose:

```bash
docker compose up --build
```

Jika data CSV/RDF berubah setelah container pernah berjalan:

```bash
docker compose run --rm rdf-loader
```

Perintah tersebut menjalankan `python_script/refresh/main.py`, yaitu:

```text
data.csv/processed/species_enriched.csv
-> generate ulang rdf/flora_fauna.ttl
-> upload RDF + ontology ke Fuseki
```

3. Buka website:

```text
http://localhost:5000
```

4. Buka SPARQL endpoint:

```text
http://localhost:3030/flora-fauna/sparql
```

Mode alternatif untuk menjalankan Flask secara lokal:

```bash
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python python_script/rdf/main.py
docker compose up -d fuseki rdf-loader
python backend/app.py
```

## 26. Pemenuhan Requirement Proyek

| Requirement | Pemenuhan |
|---|---|
| RDF | Data CSV dikonversi menjadi RDF Turtle dalam bentuk subject-predicate-object. |
| Ontology | `ontology.ttl` mendefinisikan class, object property, dan datatype property. |
| SPARQL Endpoint | Apache Jena Fuseki menyediakan endpoint `/flora-fauna/sparql`. |
| Website Pencarian | React menyediakan search bar, katalog semua data, halaman detail, compare, graph, dan tombol AI Explanation Assistant; Flask menyediakan API. |
| Knowledge Graph | Spesies, nama, kategori, habitat, dan takson dihubungkan sebagai graph dan divisualisasikan di frontend. |
| Optional KG-based RAG | Detail/compare diambil dari SPARQL, dikemas sebagai konteks JSON, lalu dijelaskan oleh Gemini tanpa menambah fakta dari luar. |

## 27. Draft Metodologi Singkat untuk Artikel Ilmiah

Metode penelitian/proyek terdiri dari beberapa tahap:

1. **Pengumpulan Data**  
   Data nama flora dan fauna Indonesia dikumpulkan dalam format CSV. Data meliputi nama ilmiah, nama Indonesia, nama Inggris, sinonim ilmiah, taksonomi, habitat, deskripsi, status endemik, dan sumber data.

2. **Perancangan Ontologi**  
   Ontologi dirancang untuk merepresentasikan konsep leksikon spesies dan taksonomi. Class yang digunakan meliputi `SpeciesEntry`, `FloraEntry`, `FaunaEntry`, `Kingdom`, `Phylum`, `TaxonomicClass`, `Order`, `Family`, `Genus`, `Category`, dan `Habitat`.

3. **Konversi CSV ke RDF**  
   Data CSV dikonversi menjadi RDF Turtle menggunakan Python dan library RDFLib. Setiap baris CSV menjadi resource spesies, sedangkan kingdom, phylum, kelas, ordo, family, genus, kategori, dan habitat menjadi resource terhubung.

4. **Pembangunan SPARQL Endpoint**  
   File RDF dan ontologi dimuat ke Apache Jena Fuseki. Endpoint SPARQL digunakan untuk menjalankan query pencarian dan relasi antarspesies.

5. **Pembangunan Website**  
   Website dibuat menggunakan React + Vite sebagai frontend modern dan Flask sebagai backend API. Backend mengirim query SPARQL ke Fuseki untuk menampilkan hasil pencarian, detail spesies, relasi satu family/satu genus, visualisasi graph, dan perbandingan dua spesies.

6. **AI Explanation Assistant Opsional**  
   Pada halaman detail dan compare, hasil query SPARQL dikemas menjadi konteks JSON lalu dikirim ke Gemini. Gemini hanya menyusun penjelasan natural language berdasarkan konteks tersebut, sehingga data utama tetap berasal dari RDF knowledge graph.

7. **Pengujian**  
   Pengujian dilakukan dengan skenario pencarian nama Indonesia, nama Latin, nama Inggris, family, genus, kategori, serta perbandingan dua spesies seperti kucing dan harimau.

## 28. Saran Pembagian Tugas Kelompok 2-3 Orang

Untuk 2 orang:

| Anggota | Tugas |
|---|---|
| Anggota 1 | Dataset CSV, validasi data, ontologi, RDF, SPARQL query. |
| Anggota 2 | Flask backend, React frontend, Docker Compose full-stack, AI Explanation Assistant, dokumentasi penggunaan. |

Untuk 3 orang:

| Anggota | Tugas |
|---|---|
| Anggota 1 | Dataset 100 spesies, sumber data, deskripsi, validasi nama. |
| Anggota 2 | Ontologi, RDF conversion, Fuseki, SPARQL endpoint, query. |
| Anggota 3 | React UI, fitur detail/compare/graph, AI Explanation Assistant, laporan dan slide presentasi. |

## Relasi Contoh: Kucing dan Harimau

Kucing:

- Nama ilmiah: `Felis catus`
- Kingdom: `Animalia`
- Phylum: `Chordata`
- Kelas: `Mammalia`
- Ordo: `Carnivora`
- Family: `Felidae`
- Genus: `Felis`

Harimau:

- Nama ilmiah: `Panthera tigris`
- Kingdom: `Animalia`
- Phylum: `Chordata`
- Kelas: `Mammalia`
- Ordo: `Carnivora`
- Family: `Felidae`
- Genus: `Panthera`

Kesimpulan:

Kucing dan harimau sama-sama berada pada kingdom Animalia, phylum Chordata, kelas Mammalia, ordo Carnivora, dan family Felidae. Namun, keduanya berbeda genus. Berdasarkan aturan sistem, relasi kedekatannya adalah **dekat** karena berada dalam family yang sama, tetapi belum **sangat dekat** karena genus berbeda.

## Potensi Pengembangan ke LLM/RAG

Knowledge graph yang dibangun dapat menjadi sumber pengetahuan terstruktur untuk Retrieval-Augmented Generation. Pada versi proyek ini, pendekatan tersebut diterapkan secara sederhana melalui AI Explanation Assistant berbasis Gemini. Sistem mengambil fakta dari SPARQL endpoint lebih dulu, lalu Gemini hanya menjelaskan fakta tersebut dalam bahasa natural.

Alur pengembangan RAG:

```text
Detail spesies atau compare
-> query SPARQL ke knowledge graph
-> hasil RDF/SPARQL sebagai konteks JSON
-> Gemini menyusun jawaban natural language
```

Batasan penting: Gemini tidak boleh menghasilkan data utama, tidak boleh menambah fakta dari luar konteks, dan tidak boleh menggantikan hasil query SPARQL.

## Referensi Validasi Dataset Final

Gunakan referensi berikut untuk validasi dataset 100 spesies:

1. GBIF Backbone Taxonomy: https://www.gbif.org/dataset/d7dddbf4-2cf0-4f39-9b2a-bb099caae36c
2. GBIF Species API: https://techdocs.gbif.org/en/openapi/
3. World Flora Online Plant List: https://wfoplantlist.org/
4. Catalogue of Life: https://www.catalogueoflife.org/

