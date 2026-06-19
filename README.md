# Flora Fauna Semantic Web Lexicon

Proyek ini adalah aplikasi web leksikon nama ilmiah flora dan fauna Indonesia berbasis RDF, ontologi, knowledge graph, dan SPARQL endpoint.

---

## DAFTAR ISI
1. [Fitur Utama](#fitur-utama)
2. [Arsitektur & Tech Stack](#arsitektur--tech-stack)
3. [Struktur Proyek](#struktur-proyek)
4. [Panduan Instalasi & Menjalankan Proyek](#panduan-instalasi--menjalankan-proyek)
   - [Prasyarat Sistem](#prasyarat-sistem)
   - [Konfigurasi Environment (AI Explanation Assistant)](#konfigurasi-environment-ai-explanation-assistant)
   - [Cara 1: Docker Compose (Sangat Direkomendasikan)](#cara-1-docker-compose-sangat-direkomendasikan)
   - [Cara 2: Lokal Tanpa Docker (Manual & Pengembang)](#cara-2-lokal-tanpa-docker-manual--pengembang)
5. [Panduan Pengguna](#panduan-pengguna)
   - [Navigasi Halaman Utama (Home)](#navigasi-halaman-utama-home)
   - [Menggunakan Katalog Spesies (Data)](#menggunakan-katalog-spesies-data)
   - [Mengeksplorasi Detail Spesies (Detail)](#mengeksplorasi-detail-spesies-detail)
   - [Membandingkan Kedekatan Spesies (Compare)](#membandingkan-kedekatan-spesies-compare)
   - [Interaksi dengan Visualisasi Graph (Graph)](#interaksi-dengan-visualisasi-graph-graph)
   - [Alur Integrasi KG-RAG (SPARQL + Gemini)](#alur-integrasi-kg-rag-sparql--gemini)
6. [Contoh Hasil (Sample Results)](#contoh-hasil-sample-results)
   - [Contoh 1: Query SPARQL Riil](#contoh-1-query-sparql-riil)
   - [Contoh 2: Respons JSON API Backend](#contoh-2-respons-json-api-backend)
   - [Contoh 3: Peta Hubungan Knowledge Graph (Tekstual)](#contoh-3-peta-hubungan-knowledge-graph-tekstual)
   - [Contoh 4: Output Penjelasan AI (Gemini Assistant)](#contoh-4-output-penjelasan-ai-gemini-assistant)
7. [Catatan Metodologi & Dataset](#catatan-metodologi--dataset)
8. [Troubleshooting](#troubleshooting)

---

## Fitur Utama

- **Pencarian Multi-parameter**: Cari berdasarkan nama Indonesia, nama Latin, nama Inggris, sinonim ilmiah, phylum, family, genus, kategori, dan deskripsi.
- **Katalog Terfilter**: Filter instan berdasarkan kingdom (`Plantae` atau `Animalia`) dan kategori spesifik (e.g., `Mamalia`, `Burung`, `Pohon`, `Palem`).
- **Detail Spesies Komprehensif**: Menampilkan informasi taksonomi terperinci, deskripsi, gambar, beserta relasi spesies dalam satu family dan genus yang sama.
- **Perbandingan Taksonomi**: Membandingkan tingkat kedalaman hubungan taksonomi (dari Kingdom hingga Genus) antara dua spesies secara dinamis.
- **Knowledge Graph Interaktif**: Visualisasi berbasis Cytoscape.js yang menunjukkan node spesies dan relasi taksonominya dengan visualisasi interaktif.
- **AI Explanation Assistant (KG-RAG)**: Integrasi dengan Gemini API untuk menjelaskan hasil query SPARQL terstruktur dalam format bahasa natural Indonesia yang luwes.
- **SPARQL Query Viewer**: Pengguna dapat melihat secara transparan query SPARQL murni yang berjalan di balik setiap fitur.

---

## Arsitektur & Tech Stack

Aplikasi ini dirancang dengan arsitektur pemisahan backend API terstruktur dan frontend modern:

- **Backend API**: Flask (Python)
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Triple Store & SPARQL Endpoint**: Apache Jena Fuseki
- **RDF Generation & RDF Converter**: Python + RDFLib
- **Visualisasi Graph**: Cytoscape.js
- **Orkestrasi Lokal**: Docker Compose

---

## Struktur Proyek

```text
backend/app.py                         Entry point Flask server
backend/routes/                        Route API dan route frontend React
backend/services/                      Logic service untuk SPARQL, graph, dan AI
backend/queries.py                     Builder query SPARQL terenkapsulasi
backend/sparql_client.py               Client SPARQLWrapper
data.csv/seed/species_seed.csv         Seed daftar spesies awal untuk enrichment
data.csv/raw/gbif_results.csv          Hasil raw enrichment dari GBIF API
data.csv/raw/wikidata_results.csv      Hasil raw enrichment dari Wikidata SPARQL
data.csv/processed/species_enriched.csv Dataset final 100 entri flora & fauna hasil pemrosesan
data.csv/ui/species_content.csv         Konten visual gambar & deskripsi khusus antarmuka UI
rdf/flora_fauna.ttl                    RDF Turtle hasil konversi akhir
ontology/ontology.ttl                  Ontologi proyek utama (kelas, properti, relasi)
python_script/scrape/main.py           Script pengumpul & pengaya data CSV
python_script/rdf/main.py              Script konverter data CSV menjadi file RDF Turtle
python_script/load/main.py             Script otomatis pengunggah RDF/Ontologi ke Fuseki
python_script/refresh/main.py          Pipa otomatis regenerasi RDF dan upload ulang
python_script/ui_content/main.py       Script generator konten media (Wikimedia & GBIF)
frontend/                              React + Vite frontend workspace
frontend/src/pages/*/page.tsx          Komposer halaman per rute
frontend/src/components/<page>/        Komponen antarmuka per modul halaman
frontend/src/components/shared/        Komponen antarmuka yang dipakai bersama
frontend/src/components/ui/            Primitive komponen UI dari shadcn/ui
Dockerfile                             Konfigurasi image Docker aplikasi Flask
docker-compose.yml                     Flask app, Apache Jena Fuseki, dan Loader RDF
```

---

## Panduan Instalasi & Menjalankan Proyek

### Prasyarat Sistem
Untuk menjalankan aplikasi ini dengan lancar, pastikan sistem Anda telah memiliki:
1. **Docker** dan **Docker Compose** (Rekomendasi utama)
2. **Python 3.10+** (Hanya diperlukan untuk instalasi manual lokal)
3. **Node.js 18+** (Hanya diperlukan untuk build frontend manual)

---

### Konfigurasi Environment (AI Explanation Assistant)
Fitur AI Assistant bersifat opsional. Jika Anda tidak menyediakan API key, aplikasi tetap berjalan normal tetapi AI Assistant akan mengembalikan pemberitahuan bahwa API key belum terkonfigurasi.

Untuk mengaktifkan AI Assistant, buatlah file bernama `.env` di direktori utama proyek:

```env
GEMINI_API_KEY=isi_dengan_api_key_gemini_anda
GEMINI_MODEL=gemini-2.5-flash
```

*(Catatan: Anda dapat menyalin file `.env.example` ke `.env` dan mengisi nilainya).*

---

### Cara 1: Docker Compose (Sangat Direkomendasikan)
Metode ini adalah cara tercepat karena akan mengonfigurasi Flask web server, Apache Jena Fuseki, serta mengunggah dataset RDF ke Fuseki secara otomatis.

1. **Jalankan Aplikasi**:
   Buka terminal di direktori utama proyek dan jalankan perintah:
   ```bash
   docker compose up --build
   ```

2. **Akses Endpoint**:
   - **Website Aplikasi**: [http://localhost:5000](http://localhost:5000)
   - **Fuseki Control Panel**: [http://localhost:3030](http://localhost:3030)
   - **SPARQL Endpoint**: `http://localhost:3030/flora-fauna/sparql`

3. **Perbarui Data RDF dalam Kontainer**:
   Jika Anda memodifikasi dataset CSV atau script konversi Python dan ingin memperbarui RDF di dalam volume Fuseki tanpa rebuild:
   ```bash
   docker compose run --rm rdf-loader
   ```
   *Perintah ini akan membaca CSV, membuat ulang `rdf/flora_fauna.ttl`, dan mengunggahnya ke Fuseki secara langsung.*

4. **Matikan Sistem dan Bersihkan Volume**:
   ```bash
   docker compose down -v
   ```

---

### Cara 2: Lokal Tanpa Docker (Manual & Pengembang)
Gunakan opsi ini jika Anda ingin melakukan pengembangan (debugging) backend Flask atau frontend React secara dinamis langsung pada host lokal Anda.

#### 1. Persiapan Database (Fuseki)
Anda tetap membutuhkan Fuseki. Cara termudah adalah menjalankan Fuseki saja via Docker:
```bash
docker compose up -d fuseki
```

#### 2. Konversi CSV ke RDF & Unggah Manual
Jalankan lingkungan virtual Python, pasang dependensi, lalu jalankan konversi:
```bash
# Membuat & mengaktifkan Virtual Environment (Windows PowerShell)
python -m venv .venv
.venv\Scripts\Activate.ps1

# Install Dependensi
pip install -r requirements.txt

# Generate file RDF (flora_fauna.ttl)
python python_script/rdf/main.py
```

Unggah Ontologi dan file RDF yang dihasilkan ke Fuseki menggunakan perintah `curl` berikut:
```bash
# Unggah Ontologi
curl -u admin:admin -X POST -H "Content-Type: text/turtle" --data-binary "@ontology/ontology.ttl" "http://localhost:3030/flora-fauna/data?default"

# Unggah RDF Data
curl -u admin:admin -X POST -H "Content-Type: text/turtle" --data-binary "@rdf/flora_fauna.ttl" "http://localhost:3030/flora-fauna/data?default"
```

#### 3. Menjalankan Backend Flask
```bash
python backend/app.py
```
Aplikasi web lokal akan tersedia di [http://localhost:5000](http://localhost:5000).

---

## Panduan Pengguna

Bagian ini memandu Anda dalam menggunakan seluruh fitur antarmuka web leksikon flora & fauna.

### Navigasi Halaman Utama (Home)
Halaman ini adalah pintu gerbang pencarian leksikon dengan desain visual premium.

- **Pencarian Cepat**: Masukkan teks pencarian Anda (contoh: "Orangutan") ke dalam search bar utama lalu tekan Enter. Anda akan diarahkan ke halaman **Katalog** dengan filter kata kunci terpasang.
- **Kategori Cepat**: Klik salah satu tombol kategori yang muncul secara acak di bawah kolom pencarian (seperti *Mamalia*, *Burung*, *Anggrek*) untuk melompat langsung ke katalog kategori tersebut.

<p align="center">
  <img src="docs/Halaman%20Utama.png" alt="Tampilan Halaman Utama" width="90%" />
</p>

---

### Menggunakan Katalog Spesies (Data)
Halaman katalog menampilkan seluruh data spesies dalam bentuk grid kartu yang dilengkapi filter interaktif di bilah sisi.

- **Bilah Sisi Filter**:
  - **Pencarian Teks**: Menyaring data berdasarkan nama umum, nama ilmiah, genus, family, atau deskripsi.
  - **Kingdom**: Memilih `Semua`, `Plantae` (tumbuhan), atau `Animalia` (hewan).
  - **Kategori**: Dropdown yang memuat semua kategori unik yang ada dalam database.
- **Tombol SPARQL**: Di sebelah kanan atas grid, klik tombol **SPARQL** untuk melihat query SPARQL yang sedang aktif menyaring katalog.

<p align="center">
  <img src="docs/Katalog%20Spesies.png" alt="Tampilan Katalog Spesies" width="90%" />
</p>

- **Kartu Spesies**: Setiap kartu menampilkan gambar spesies, nama Indonesia, nama ilmiah (cetak miring), kategori, dan potongan deskripsi ringkas. Klik kartu untuk melihat detail spesies tersebut.

<p align="center">
  <img src="docs/SPARQL%20Query.png" alt="Tampilan Pop-up Query SPARQL" width="90%" />
</p>

---

### Mengeksplorasi Detail Spesies (Detail)
Halaman ini menampilkan seluruh fakta terstruktur dari spesies yang dipilih.

- **Detail Leksikon**: Menampilkan Nama Indonesia, Nama Inggris, Nama Ilmiah, Sinonim Ilmiah, Habitat, Status Endemisitas, dan tautan referensi asli data (Wikidata / GBIF).
- **Struktur Taksonomi**: Ditampilkan secara hierarkis di bilah sisi kanan (Kingdom $\rightarrow$ Phylum $\rightarrow$ Class $\rightarrow$ Order $\rightarrow$ Family $\rightarrow$ Genus).
- **Spesies Terkait (Related Species)**: Berdasarkan relasi di RDF, bagian ini menampilkan spesies lain yang berbagi **Family** atau **Genus** yang sama.
- **Tombol Aksi**:
  - **Lihat Graph**: Membuka visualisasi knowledge graph lokal terfokus untuk spesies ini.
  - **Lihat SPARQL**: Menampilkan query detail dan query relasi spesies se-famili/genus.
  - **Jelaskan dengan AI**: Mengirimkan konteks hasil SPARQL ke Gemini API untuk menghasilkan teks penjelasan terperinci mengenai identitas dan relasi spesies dalam bahasa natural.

<p align="center">
  <img src="docs/Detail%20Spesies.png" alt="Tampilan Detail Spesies" width="90%" />
</p>

---

### Membandingkan Kedekatan Spesies (Compare)
Modul ini digunakan untuk menganalisis kekerabatan taksonomi antara dua entri spesies yang dipilih.

1. Masuk ke menu **Bandingkan**.
2. Pilih **Spesies A** (contoh: *Kucing Domestik*) dan **Spesies B** (contoh: *Harimau*) dari dropdown yang disediakan.
3. Klik **Bandingkan**.
4. Antarmuka akan merender:
   - **Kartu Spesies A & B**: Ringkasan data dasar kedua spesies berdampingan.
   - **Tabel Perbandingan Taksonomi**: Menampilkan tingkat taksonomi utama (Kingdom, Phylum, Class, Order, Family, Genus), nilai masing-masing spesies pada tingkatan tersebut, serta indikator kesamaan (Centang Hijau jika sama, Silang Merah jika berbeda).
   - **Kesimpulan Otomatis**: Analisis tekstual otomatis (e.g., *"Kedua spesies berbagi 5 tingkat taksonomi utama: Kingdom, Phylum, Kelas, Ordo, dan Family. Hubungan dekat karena satu family, tetapi berbeda genus."*).
   - **Penjelasan AI**: Klik **Jelaskan dengan AI** untuk memperoleh deskripsi hubungan kekerabatan mendalam berbasis konteks SPARQL yang disusun oleh Gemini.

<p align="center">
  <img src="docs/Bandingkan%20Spesies.png" alt="Tampilan Perbandingan Spesies" width="90%" />
</p>

---

### Interaksi dengan Visualisasi Graph (Graph)
Visualisasi graph memberikan pemetaan relasional dinamis dari leksikon:

- **Global Graph**: Jika diakses langsung via menu navigasi atas, menampilkan relasi makro seluruh entri leksikon.
- **Fokus Spesies**: Jika diakses dari detail spesies, graph akan memfilter visualisasi hanya pada spesies fokus beserta hubungan taksonomi yang relevan.
- **Interaksi Kanvas**:
  - *Zoom & Pan*: Gunakan scroll mouse untuk memperbesar/memperkecil dan seret kanvas untuk menggeser.
  - *Drag Node*: Klik dan seret node untuk menata ulang tata letak (layout) secara dinamis.
  - *Klik Node*: Klik node spesies untuk memunculkan detail data di tooltip samping atau melompat langsung ke halaman detail spesies tersebut.

<p align="center">
  <img src="docs/Knowledge%20Graph.png" alt="Tampilan Visualisasi Knowledge Graph" width="90%" />
</p>

---

### Alur Integrasi KG-RAG (SPARQL + Gemini)
Sistem AI Assistant dalam proyek ini menggunakan pendekatan Knowledge Graph-based Retrieval-Augmented Generation (KG-RAG):

```text
+--------------+     1. Trigger     +-------------------+     2. Query     +-------------------+
|  Pengguna    | -----------------> |   Backend API     | ---------------> |    Jena Fuseki    |
| (Klik AI)    | <----------------- |    (Flask)        | <--------------- | (SPARQL Endpoint) |
+--------------+   5. NL Response   +-------------------+    3. RDF Data   +-------------------+
                                              |
                                              | 4. Context + Prompt
                                              v
                                    +-------------------+
                                    |    Gemini API     |
                                    | (Model Assistant) |
                                    +-------------------+
```
1. Pengguna memicu tombol **Jelaskan dengan AI** di halaman Detail/Bandingkan.
2. Backend Flask mengirimkan query SPARQL terenkapsulasi ke Fuseki.
3. Fuseki mengembalikan data relasional terstruktur (format JSON binding).
4. Backend membungkus data hasil query tersebut menjadi dokumen konteks JSON, menggabungkannya dengan prompt instruksi sistem yang melarang model berhalusinasi di luar konteks, lalu mengirimkannya ke Gemini API.
5. Gemini menyusun teks ringkasan penjelasan natural bahasa Indonesia dan mengembalikannya ke frontend untuk ditampilkan ke pengguna.

---

## Contoh Hasil (Sample Results)

### Contoh 1: Query SPARQL Riil
Berikut adalah query SPARQL yang digunakan backend untuk membandingkan taksonomi antara **Kucing Domestik (`kucing`)** dan **Harimau (`harimau`)**:

```sparql
PREFIX ff: <http://example.org/flora-fauna/ontology#>
PREFIX data: <http://example.org/flora-fauna/resource/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

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

---

### Contoh 2: Respons JSON API Backend
Endpoint: `GET /api/compare?species_a=kucing&species_b=harimau`

Respons data terstruktur dari API backend:
```json
{
  "comparison": [
    { "level": "Kingdom", "labelA": "Animalia", "labelB": "Animalia", "same": true },
    { "level": "Phylum", "labelA": "Chordata", "labelB": "Chordata", "same": true },
    { "level": "Kelas", "labelA": "Mammalia", "labelB": "Mammalia", "same": true },
    { "level": "Ordo", "labelA": "Carnivora", "labelB": "Carnivora", "same": true },
    { "level": "Family", "labelA": "Felidae", "labelB": "Felidae", "same": true },
    { "level": "Genus", "labelA": "Felis", "labelB": "Panthera", "same": false }
  ],
  "conclusion": "Keduanya berbagi 5 tingkat taksonomi utama: Kingdom, Phylum, Kelas, Ordo, dan Family. Hubungan dekat karena satu family, tetapi berbeda genus.",
  "speciesA": {
    "id": "kucing",
    "indonesianName": "Kucing Domestik",
    "scientificName": "Felis catus"
  },
  "speciesB": {
    "id": "harimau",
    "indonesianName": "harimau",
    "scientificName": "Panthera tigris"
  },
  "error": null,
  "sparql": "... (Query SPARQL Lengkap) ..."
}
```

---

### Contoh 3: Peta Hubungan Knowledge Graph (Tekstual)
Berikut adalah visualisasi hubungan terstruktur dari RDF Triple Store antara beberapa entitas taksonomi:

```text
       [Kingdom: Animalia]
               ^
               | hasKingdom
        [Phylum: Chordata]
               ^
               | hasPhylum
       [Kelas: Mammalia]
               ^
               | hasTaxonomicClass
       [Ordo: Carnivora]
               ^
               | hasOrder
        [Family: Felidae]
         ^             ^
        /               \ hasFamily
       /                 \
 [Genus: Felis]     [Genus: Panthera]
      ^                     ^
      | hasGenus            | hasGenus
[Kucing Domestik]        [Harimau]
  (Felis catus)      (Panthera tigris)
```

---

### Contoh 4: Output Penjelasan AI (Gemini Assistant)

#### A. Penjelasan Detail Spesies: *Patma Raksasa (Rafflesia arnoldii)*
> **Pertanyaan/Aksi**: *Jelaskan detail spesies berdasarkan entri leksikon.*
>
> **Output AI**:
> "Patma raksasa (*Rafflesia arnoldii*) adalah spesies tumbuhan parasit yang terkenal dengan bunga raksasanya. Berdasarkan data taksonomi terstruktur, spesies ini tergolong ke dalam kingdom **Plantae**, phylum **Tracheophyta** (tumbuhan berpembuluh), kelas **Magnoliopsida** (dikotil), ordo **Malpighiales**, family **Rafflesiaceae**, dan genus **Rafflesia**. Spesies ini memiliki sinonim ilmiah resmi yakni *Rafflesia titan*. Data taksonomi ini terverifikasi secara sahih dari data rujukan GBIF dan Wikidata."

#### B. Penjelasan Perbandingan Spesies: *Kucing Domestik vs Harimau*
> **Pertanyaan/Aksi**: *Jelaskan hubungan kekerabatan taksonomi.*
>
> **Output AI**:
> "Berdasarkan query SPARQL terstruktur, **Kucing Domestik (*Felis catus*)** dan **Harimau (*Panthera tigris*)** memiliki tingkat kekerabatan yang **sangat dekat**. Keduanya berbagi lima tingkatan taksonomi utama yang identik: mereka berada di kingdom **Animalia**, phylum **Chordata**, kelas **Mammalia**, ordo **Carnivora**, dan family **Felidae**.
> 
> Perbedaan kekerabatan keduanya baru muncul pada tingkat **Genus**, di mana Kucing Domestik tergolong genus **Felis**, sedangkan Harimau tergolong genus **Panthera**. Karena kesamaan mencapai tingkat famili (Felidae), secara biologis mereka adalah kerabat dekat yang berbagi banyak karakteristik fisik dan perilaku pemangsa, meskipun memiliki perbedaan ukuran tubuh, habitat, dan sifat domestikasi yang signifikan."

---

## Catatan Metodologi & Dataset

1. **Dataset**: Dataset saat ini berjumlah **100 entri** yang terbagi seimbang atas **50 spesies flora** dan **50 spesies fauna** khas Indonesia.
2. **Pengayaan Data (Enrichment Pipeline)**:
   - Data taksonomi utama diperoleh secara dinamis dari **GBIF Backbone Taxonomy API** untuk memastikan validitas struktur ilmiahnya.
   - Data pelengkap (seperti habitat dan status endemisitas) diperkaya menggunakan kueri langsung ke **Wikidata SPARQL Endpoint** menggunakan properti seperti `P2974` (habitat) dan `P183` (endemik).
3. **Penyusunan Seed**: Target spesies ditentukan dari daftaran berkurasi di `data.csv/seed/species_seed.csv` yang disaring secara manual, bukan diperoleh dari proses scraping liar untuk menjaga kualitas relevansi leksikon.
4. **Validitas RDF**: File RDF (`rdf/flora_fauna.ttl`) diproduksi menggunakan pustaka RDFLib dengan memetakan CSV ke kelas dan properti ontologi resmi yang didefinisikan pada `ontology/ontology.ttl`.

---

## Troubleshooting

### Layar Website Kosong Putih (Blank Page)
Jika Anda mengakses halaman web dan hanya melihat layar putih kosong:
1. **Jangan Membuka File HTML Langsung**: Jangan membuka file `frontend/dist/index.html` langsung dengan mengkliknya dari File Explorer. File tersebut harus disajikan lewat web server Flask atau Vite development server.
2. **Rebuild Container Docker**:
   Hentikan kontainer secara menyeluruh beserta volumenya, lalu jalankan ulang:
   ```bash
   docker compose down -v
   docker compose up --build
   ```
3. **Periksa DevTools Browser**:
   Buka tombol `F12` $\rightarrow$ pilih tab **Console**. Jika terdapat error `404` untuk pemuatan file `/assets/index-*.js`, pastikan Flask server dapat mengakses folder static build React di backend. Aplikasi web versi terbaru sudah dibekali pesan fallback cerdas jika React gagal dimuat sehingga layar putih kosong polos tidak akan muncul lagi.
