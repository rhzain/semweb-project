# Flora Fauna Semantic Web Lexicon

Proyek ini adalah aplikasi web leksikon nama ilmiah flora dan fauna Indonesia berbasis RDF, ontologi, knowledge graph, dan SPARQL endpoint.

## Fitur

- Pencarian nama Indonesia, nama Latin, nama Inggris, sinonim ilmiah, family, genus, kategori, dan deskripsi.
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
- Frontend: React + Vite
- Visualisasi graph: Cytoscape.js
- RDF conversion: Python + RDFLib
- Triple store dan SPARQL endpoint: Apache Jena Fuseki
- Orkestrasi lokal: Docker Compose

## Struktur

```text
data/flora_fauna.csv       Dataset CSV 100 entri tervalidasi
data/flora_fauna.ttl       RDF Turtle hasil konversi
data/validation_report.csv Laporan validasi GBIF/Wikidata
ontology/ontology.ttl      Ontologi proyek
scripts/build_validated_dataset.py Generator dataset tervalidasi dari GBIF/Wikidata
scripts/csv_to_rdf.py      Konverter CSV ke RDF
scripts/load_rdf_to_fuseki.py Loader RDF otomatis ke Fuseki
app.py                     Aplikasi Flask
Dockerfile                 Image Flask app dan RDF loader
docker-compose.yml         Flask app, Apache Jena Fuseki, dan RDF loader
frontend/                  React + Vite frontend
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

1. Membaca `data/flora_fauna.csv`
2. Generate ulang `data/flora_fauna.ttl`
3. Upload ulang RDF + ontologi ke Fuseki

Karena folder `data/`, `ontology/`, dan `scripts/` di-bind mount ke container loader, perubahan CSV atau script bisa dipakai tanpa rebuild image.

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
Berdasarkan hasil SPARQL, Kucing (Felis catus) dan Harimau (Panthera tigris) sama-sama berada pada kingdom Animalia, kelas Mammalia, ordo Carnivora, dan family Felidae. Keduanya berbeda genus, yaitu Felis dan Panthera. Kesimpulannya, hubungan keduanya dekat karena berada dalam family yang sama, tetapi tidak sangat dekat karena genus berbeda.
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
python scripts/csv_to_rdf.py
```

Jalankan Fuseki dan loader RDF saja:

```bash
docker compose up -d fuseki rdf-loader
```

Jika menjalankan mode lokal manual tanpa service `rdf-loader`, upload ontologi dan RDF:

```bash
curl -u admin:admin -X POST -H "Content-Type: text/turtle" --data-binary "@ontology/ontology.ttl" "http://localhost:3030/flora-fauna/data?default"
curl -u admin:admin -X POST -H "Content-Type: text/turtle" --data-binary "@data/flora_fauna.ttl" "http://localhost:3030/flora-fauna/data?default"
```

Jalankan website:

```bash
python app.py
```

Buka:

```text
http://localhost:5000
```

## Catatan Dataset

Dataset sekarang berisi 100 entri:

- 50 flora dengan kingdom `Plantae`
- 50 fauna dengan kingdom `Animalia`

Data taksonomi divalidasi menggunakan GBIF Species API/GBIF Backbone Taxonomy. Jika GBIF tidak mengisi level taksonomi tertentu, script memakai Wikidata sebagai fallback terbuka. Kolom `sumber_data` berisi URL GBIF dan, jika tersedia, URL Wikidata untuk setiap entri.

File pendukung:

- `data/flora_fauna.csv`: dataset utama
- `data/validation_report.csv`: laporan scientific name input, accepted scientific name, GBIF key, URL GBIF, URL Wikidata, status taksonomi, dan rank
- `scripts/build_validated_dataset.py`: script untuk membangun ulang dataset dari sumber terbuka

Untuk membangun ulang dataset dari sumber terbuka, koneksi internet diperlukan:

```bash
python scripts/build_validated_dataset.py
python scripts/csv_to_rdf.py
```

## Catatan Frontend

Frontend proyek ini memakai React + Vite agar UI lebih modern dan tetap clean. Flask tidak lagi merender halaman utama dengan template Jinja; Flask berperan sebagai API backend dan server hasil build React.

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
