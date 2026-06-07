# Flora Fauna Semantic Web Lexicon

Proyek ini adalah aplikasi web leksikon nama ilmiah flora dan fauna Indonesia berbasis RDF, ontologi, knowledge graph, dan SPARQL endpoint.

## Fitur

- Pencarian nama Indonesia, nama Latin, nama Inggris, sinonim ilmiah, phylum, family, genus, kategori, dan deskripsi.
- Katalog semua data flora-fauna yang sudah dimuat ke RDF.
- Filter kingdom `Plantae` atau `Animalia`.
- Filter kategori seperti `Mamalia`, `Burung`, `Pohon`, `Palem`, dan lainnya.
- Halaman detail spesies.
- Relasi spesies satu family dan satu genus.
- Perbandingan hubungan dua spesies.
- Visualisasi knowledge graph berbasis node dan edge.
- AI Explanation Assistant opsional berbasis Gemini untuk menjelaskan hasil SPARQL.
- Tampilan query SPARQL yang digunakan.

## Stack

- Backend API: Flask
- Frontend: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- Visualisasi graph: Cytoscape.js
- RDF conversion: Python + RDFLib
- Triple store dan SPARQL endpoint: Apache Jena Fuseki
- Orkestrasi lokal: Docker Compose

## Struktur

```text
backend/app.py                         Entry point Flask
backend/routes/                        Route API dan route frontend React
backend/services/                      Logic service untuk SPARQL, graph, dan AI
backend/queries.py                     Builder query SPARQL
backend/sparql_client.py               Client SPARQLWrapper
data.csv/seed/species_seed.csv         Seed daftar spesies yang akan dicari ke API
data.csv/raw/gbif_results.csv          Hasil raw enrichment dari GBIF
data.csv/raw/wikidata_results.csv      Hasil raw enrichment dari Wikidata
data.csv/processed/species_enriched.csv Dataset final 100 entri hasil enrichment
data.csv/ui/species_content.csv         Konten gambar dan deskripsi khusus UI
rdf/flora_fauna.ttl                    RDF Turtle hasil konversi
ontology/ontology.ttl                  Ontologi proyek
python_script/scrape/main.py           Entry point scrape/enrichment CSV
python_script/rdf/main.py              Entry point konversi CSV ke RDF
python_script/load/main.py             Entry point upload RDF ke Fuseki
python_script/refresh/main.py          Entry point regenerate RDF dan upload
python_script/ui_content/main.py       Generator CSV gambar/deskripsi khusus UI
frontend/                              React + Vite frontend
frontend/src/pages/*/page.tsx          Page composer untuk setiap route
frontend/src/components/<page>/        Section/component khusus per halaman
frontend/src/components/shared/        Component lintas halaman
frontend/src/components/ui/            Source component shadcn/ui
frontend/src/hooks/                     Hook data fetching frontend
frontend/src/types/                     Type payload API frontend
Dockerfile                             Image Flask app dan RDF loader
docker-compose.yml                     Flask app, Apache Jena Fuseki, dan RDF loader
```

## Menjalankan Proyek

### Cara 1: Docker Compose

Cara ini menjalankan seluruh aplikasi: Flask website, Apache Jena Fuseki, dan loader RDF otomatis.

```bash
docker compose up --build
```

Buka website:

```text
http://localhost:5000
```

Buka Fuseki:

```text
http://localhost:3030
```

SPARQL endpoint:

```text
http://localhost:3030/flora-fauna/sparql
```

Jika ingin mengulang dari volume kosong:

```bash
docker compose down -v
docker compose up --build
```

Jika hanya data RDF berubah dan container sudah pernah berjalan:

```bash
docker compose run --rm rdf-loader
```

Perintah itu akan:

1. Membaca `data.csv/processed/species_enriched.csv`
2. Generate ulang `rdf/flora_fauna.ttl`
3. Upload ulang RDF + ontologi ke Fuseki

Karena folder `data.csv/`, `rdf/`, `ontology/`, dan `python_script/` di-bind mount ke container loader, perubahan CSV atau script bisa dipakai tanpa rebuild image.

### Mengaktifkan AI Explanation Assistant

Fitur ini opsional dan tidak menggantikan RDF, ontologi, SPARQL endpoint, atau website pencarian. Gemini hanya dipakai sebagai lapisan penjelas natural language dari konteks hasil SPARQL.

Tanpa API key, tombol AI tetap aman digunakan tetapi backend akan menampilkan pesan bahwa `GEMINI_API_KEY` belum diset. Untuk memakai Gemini, set environment variable sebelum menjalankan Docker Compose.

PowerShell:

```powershell
$env:GEMINI_API_KEY="isi_api_key_gemini"
$env:GEMINI_MODEL="gemini-2.5-flash"
docker compose up --build
```

Atau buat file `.env`:

```env
GEMINI_API_KEY=isi_api_key_gemini
GEMINI_MODEL=gemini-2.5-flash
```

Contoh variabel tersedia di `.env.example`.

Alur fitur:

```text
User membuka detail atau compare
→ Flask menjalankan SPARQL ke Fuseki
→ hasil SPARQL dibuat menjadi konteks JSON
→ Gemini menerima konteks tersebut
→ Gemini membuat penjelasan bahasa Indonesia
```

Endpoint backend:

- `POST /api/ai/explain/species/<id>`
- `POST /api/ai/explain/compare?species_a=kucing&species_b=harimau`

Prompt template yang digunakan menegaskan bahwa jawaban AI hanya boleh berdasarkan konteks JSON hasil SPARQL. Contoh output untuk kucing dan harimau:

```text
Berdasarkan hasil SPARQL, Kucing (Felis catus) dan Harimau (Panthera tigris) sama-sama berada pada kingdom Animalia, phylum Chordata, kelas Mammalia, ordo Carnivora, dan family Felidae. Keduanya berbeda genus, yaitu Felis dan Panthera. Kesimpulannya, hubungan keduanya dekat karena berada dalam family yang sama, tetapi tidak sangat dekat karena genus berbeda.
```

Dengan pola ini, fitur AI merupakan bentuk sederhana Knowledge Graph-based RAG: RDF/SPARQL menjadi sumber fakta terstruktur, sedangkan Gemini hanya mengubah fakta tersebut menjadi penjelasan natural.

### Cara 2: Lokal Tanpa Docker untuk Flask

Gunakan cara ini kalau ingin mengembangkan Flask langsung dari host.

Install dependency Python:

```bash
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Generate RDF dari CSV:

```bash
python python_script/rdf/main.py
```

Jalankan Fuseki dan loader RDF saja:

```bash
docker compose up -d fuseki rdf-loader
```

Jika menjalankan mode lokal manual tanpa service `rdf-loader`, upload ontologi dan RDF:

```bash
curl -u admin:admin -X POST -H "Content-Type: text/turtle" --data-binary "@ontology/ontology.ttl" "http://localhost:3030/flora-fauna/data?default"
curl -u admin:admin -X POST -H "Content-Type: text/turtle" --data-binary "@rdf/flora_fauna.ttl" "http://localhost:3030/flora-fauna/data?default"
```

Jalankan website:

```bash
python backend/app.py
```

Buka:

```text
http://localhost:5000
```

## Catatan Dataset

Dataset sekarang berisi 100 entri:

- 50 flora dengan kingdom `Plantae`
- 50 fauna dengan kingdom `Animalia`

Data taksonomi, termasuk `phylum`, divalidasi menggunakan GBIF Species API/GBIF Backbone Taxonomy dan diperkaya dengan Wikidata bila tersedia. Nama umum diambil dari Wikidata label dan GBIF `vernacularNames`; deskripsi dari Wikidata description dan GBIF `descriptions`; habitat dari Wikidata `P2974` dan GBIF `speciesProfiles`; status endemik dari Wikidata `P183` bila tersedia. Kolom `sumber_data` berisi URL GBIF dan, jika tersedia, URL Wikidata untuk setiap entri.

Catatan metodologi: `data.csv/seed/species_seed.csv` adalah seed daftar target spesies yang disusun manual untuk kebutuhan proyek, bukan hasil scraping otomatis. File ini hanya menentukan spesies apa yang akan dicari ke API. Data detail diambil dari GBIF/Wikidata oleh logic `python_script/scrape/`. Field yang tidak tersedia dari API ditulis sebagai `Tidak tersedia dari API`, tanpa data lokal pengganti.

Beberapa field seperti habitat dan status endemik tidak selalu tersedia secara terstruktur di GBIF/Wikidata untuk semua spesies. Pipeline tidak mengarang nilai untuk menutup kekosongan tersebut; kelengkapan 100% hanya bisa dicapai jika proyek menambah sumber terstruktur lain atau melakukan kurasi manual yang sumbernya dicatat jelas.

File pendukung:

- `data.csv/seed/species_seed.csv`: seed daftar target spesies dan sumber penyusunan seed
- `data.csv/raw/gbif_results.csv`: hasil raw GBIF, termasuk accepted scientific name, GBIF key, URL GBIF, nama umum, deskripsi, habitat, life form, status taksonomi, rank, kingdom, phylum, kelas, ordo, family, dan genus
- `data.csv/raw/wikidata_results.csv`: hasil raw Wikidata, termasuk URL Wikidata, label, deskripsi, habitat, endemic to, dan taksonomi bila tersedia
- `data.csv/processed/species_enriched.csv`: dataset utama yang dipakai untuk RDF
- `data.csv/ui/species_content.csv`: enrichment terpisah untuk gambar, sumber gambar, dan deskripsi UI; file ini tidak ditimpa proses scrape
- `rdf/flora_fauna.ttl`: hasil RDF Turtle dari CSV
- `python_script/scrape/main.py`: script utama scrape/enrichment dataset
- `python_script/rdf/main.py`: script utama konversi RDF
- `python_script/ui_content/main.py`: mengambil gambar Wikimedia Commons/GBIF dan membuat deskripsi dari field taksonomi tervalidasi

Untuk membangun ulang dataset dari sumber terbuka, koneksi internet diperlukan:

```bash
python python_script/scrape/main.py
python python_script/rdf/main.py
```

Jika memakai Docker dan tidak ingin service dependency ikut dijalankan saat scrape:

```bash
docker compose run --rm --no-deps web python python_script/scrape/main.py
docker compose run --rm --no-deps web python python_script/rdf/main.py
docker compose run --rm rdf-loader
```

Output scrape ditulis ke `data.csv/raw/` dan `data.csv/processed/species_enriched.csv`.

## Catatan Frontend

Frontend proyek ini memakai React, TypeScript, Vite, Tailwind CSS, dan shadcn/ui. Setiap route disusun di `frontend/src/pages/*/page.tsx`, sedangkan section halaman berada di `frontend/src/components/<page>/`. Component yang dipakai lintas halaman berada di `frontend/src/components/shared/`, dan primitive shadcn berada di `frontend/src/components/ui/`.

Flask tidak lagi merender halaman utama dengan template Jinja; Flask berperan sebagai API backend dan server hasil build React.

## Troubleshooting

### Halaman frontend putih kosong

Jangan membuka `frontend/dist/index.html` langsung dari file explorer. React build harus disajikan lewat Flask atau Vite dev server.

Jalankan melalui Docker:

```bash
docker compose down -v
docker compose up --build
```

Lalu buka:

```text
http://localhost:5000
```

Jika masih putih, buka DevTools Console dan Network. Pastikan file `/assets/index-*.js` dan `/assets/index-*.css` berstatus `200`, bukan `404`. Versi terbaru sudah menampilkan pesan fallback jika React gagal dimuat, jadi layar tidak akan kosong polos lagi.
