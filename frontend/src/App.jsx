import {
  ArrowRight,
  Database,
  GitCompare,
  Network,
  Search,
  Sparkles,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

async function getJson(path, options) {
  const response = await fetch(path, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

function useApi(path, fallback) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getJson(path)
      .then((result) => {
        if (alive) {
          setData(result);
          setError(result.error || "");
        }
      })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [path]);

  return { data, loading, error };
}

function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/species/:speciesId" element={<DetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/graph" element={<GraphPage />} />
        </Routes>
      </main>
    </div>
  );
}

function Header() {
  const links = [
    { to: "/", label: "Cari", icon: Search },
    { to: "/data", label: "Semua Data", icon: Database },
    { to: "/graph", label: "Graph", icon: Network },
    { to: "/compare", label: "Bandingkan", icon: GitCompare },
  ];

  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <span className="brand-mark">KG</span>
        <span>
          <strong>Flora Fauna Lexicon</strong>
          <small>RDF · Ontology · SPARQL</small>
        </span>
      </Link>
      <nav className="nav-links" aria-label="Navigasi utama">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ q: "", kingdom: "", category: "" });
  const { data: categoryData } = useApi("/api/categories", { categories: [] });

  function submit(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    Object.entries(form).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    navigate(`/data?${params.toString()}`);
  }

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Knowledge Graph Leksikon Indonesia</p>
          <h1>Leksikon nama ilmiah, nama lokal, dan relasi taksonomi flora-fauna.</h1>
          <p className="hero-copy">
            Cari spesies dari nama Indonesia, nama Latin, nama Inggris, phylum, family, genus, kategori,
            atau sinonim ilmiah. Hasilnya berasal dari RDF Turtle yang di-query melalui SPARQL.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="button primary" to="/data">
            <Database size={18} />
            Lihat semua data
          </Link>
          <Link className="button ghost" to="/graph">
            <Network size={18} />
            Buka graph
          </Link>
        </div>
      </section>

      <section className="panel">
        <form className="search-form" onSubmit={submit}>
          <label className="field wide">
            <span>Kata kunci</span>
            <div className="input-icon">
              <Search size={18} />
              <input
                value={form.q}
                onChange={(event) => setForm({ ...form, q: event.target.value })}
                placeholder="Contoh: kucing, Panthera, Felidae, Mamalia"
              />
            </div>
          </label>
          <label className="field">
            <span>Kingdom</span>
            <select
              value={form.kingdom}
              onChange={(event) => setForm({ ...form, kingdom: event.target.value })}
            >
              <option value="">Semua</option>
              <option value="Plantae">Plantae</option>
              <option value="Animalia">Animalia</option>
            </select>
          </label>
          <label className="field">
            <span>Kategori</span>
            <select
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
            >
              <option value="">Semua</option>
              {categoryData.categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <button className="button primary" type="submit">
            Cari
            <ArrowRight size={18} />
          </button>
        </form>
      </section>

      <section className="feature-grid">
        <FeatureCard icon={Database} title="Katalog semua data" text="Tampilkan seluruh entri RDF sebagai katalog yang bisa difilter." />
        <FeatureCard icon={Network} title="Visualisasi graph" text="Lihat node spesies, kingdom, phylum, family, genus, dan kategori sebagai knowledge graph." />
        <FeatureCard icon={Sparkles} title="AI Explanation Assistant" text="Gemini menjelaskan hasil SPARQL tanpa menjadi sumber data utama." />
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <article className="feature-card">
      <Icon size={22} />
      <h2>{title}</h2>
      <p>{text}</p>
    </article>
  );
}

function DataPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const kingdom = params.get("kingdom") || "";
  const category = params.get("category") || "";
  const queryString = `/api/species?${params.toString()}`;
  const { data, loading, error } = useApi(queryString, { items: [], sparql: "" });
  const { data: categoryData } = useApi("/api/categories", { categories: [] });

  function updateParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="Katalog RDF"
        title="Semua Data Flora dan Fauna"
        text="Katalog ini menampilkan seluruh entri leksikon yang dimuat dari RDF Turtle ke SPARQL endpoint."
      />

      <section className="panel">
        <div className="toolbar">
          <label className="field wide">
            <span>Cari data</span>
            <div className="input-icon">
              <Search size={18} />
              <input value={q} onChange={(event) => updateParam("q", event.target.value)} placeholder="Nama, phylum, family, genus, kategori" />
            </div>
          </label>
          <label className="field">
            <span>Kingdom</span>
            <select value={kingdom} onChange={(event) => updateParam("kingdom", event.target.value)}>
              <option value="">Semua</option>
              <option value="Plantae">Plantae</option>
              <option value="Animalia">Animalia</option>
            </select>
          </label>
          <label className="field">
            <span>Kategori</span>
            <select value={category} onChange={(event) => updateParam("category", event.target.value)}>
              <option value="">Semua</option>
              {categoryData.categories.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <StatusLine loading={loading} error={error} count={data.items.length} />
      <SpeciesGrid items={data.items} />
      <QueryBox query={data.sparql} />
    </div>
  );
}

function SpeciesGrid({ items }) {
  if (!items.length) {
    return <div className="empty-state">Belum ada data yang cocok.</div>;
  }

  return (
    <section className="species-grid">
      {items.map((item) => (
        <article className="species-card" key={item.id}>
          <div>
            <p className="card-kicker">{item.kingdomLabel} · {item.categoryLabel}</p>
            <h2>{item.indonesianName}</h2>
            <p className="latin">{item.scientificName}</p>
          </div>
          <dl className="mini-meta">
            <div>
              <dt>Phylum</dt>
              <dd>{item.phylumLabel}</dd>
            </div>
            <div>
              <dt>Family</dt>
              <dd>{item.familyLabel}</dd>
            </div>
            <div>
              <dt>Inggris</dt>
              <dd>{item.englishName}</dd>
            </div>
          </dl>
          <Link className="button subtle" to={`/species/${item.id}`}>
            Detail
            <ArrowRight size={16} />
          </Link>
        </article>
      ))}
    </section>
  );
}

function DetailPage() {
  const { speciesId } = useParams();
  const { data, loading, error } = useApi(`/api/species/${speciesId}`, { item: null, related: [], sparql: {} });
  const [aiExplanation, setAiExplanation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    setAiExplanation(null);
  }, [speciesId]);

  async function explainWithAi() {
    setAiLoading(true);
    try {
      const result = await getJson(`/api/ai/explain/species/${speciesId}`, { method: "POST" });
      setAiExplanation(result);
    } catch (err) {
      setAiExplanation({ answer: null, error: err.message, mode: "error" });
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) return <StatusLine loading count={0} />;
  if (error) return <div className="empty-state">Gagal memuat detail: {error}</div>;
  if (!data.item) return <div className="empty-state">Spesies tidak ditemukan.</div>;

  const item = data.item;

  return (
    <div className="page-stack">
      <section className="detail-hero">
        <div>
          <p className="eyebrow">{item.kingdomLabel} · {item.categoryLabel}</p>
          <h1>{item.indonesianName}</h1>
          <p className="latin large">{item.scientificName}</p>
        </div>
        <div className="action-row">
          <button className="button primary" onClick={explainWithAi} disabled={aiLoading} type="button">
            <Sparkles size={18} />
            {aiLoading ? "Meminta AI..." : "Jelaskan dengan AI"}
          </button>
          <Link className="button ghost" to={`/graph?species_id=${item.id}`}>
            <Network size={18} />
            Lihat graph
          </Link>
        </div>
      </section>

      <AIExplanationPanel explanation={aiExplanation} />

      <section className="detail-grid">
        <InfoPanel title="Entri Leksikon" rows={[
          ["Nama Indonesia", item.indonesianName],
          ["Nama ilmiah", item.scientificName],
          ["Nama Inggris", item.englishName],
          ["Sinonim ilmiah", item.scientificSynonyms || "-"],
          ["Sumber data", item.sourceData],
        ]} />
        <InfoPanel title="Taksonomi" rows={[
          ["Kingdom", item.kingdomLabel],
          ["Phylum", item.phylumLabel],
          ["Kelas", item.classLabel],
          ["Ordo", item.orderLabel],
          ["Family", item.familyLabel],
          ["Genus", item.genusLabel],
        ]} />
      </section>

      <section>
        <SectionHeader title="Spesies Terkait" text="Relasi ini dihitung dari kesamaan family atau genus dalam knowledge graph." />
        <SpeciesGrid items={data.related} />
      </section>

      <QueryBox query={`${data.sparql.detail || ""}\n\n${data.sparql.related || ""}`} />
    </div>
  );
}

function ComparePage() {
  const [params, setParams] = useSearchParams();
  const speciesA = params.get("species_a") || "kucing";
  const speciesB = params.get("species_b") || "harimau";
  const { data: optionsData } = useApi("/api/species-options", { items: [] });
  const [aiExplanation, setAiExplanation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const { data, loading, error } = useApi(`/api/compare?species_a=${speciesA}&species_b=${speciesB}`, {
    comparison: [],
    speciesA: null,
    speciesB: null,
    sparql: "",
  });

  function update(key, value) {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next);
  }

  useEffect(() => {
    setAiExplanation(null);
  }, [speciesA, speciesB]);

  async function explainRelationshipWithAi() {
    setAiLoading(true);
    try {
      const result = await getJson(`/api/ai/explain/compare?species_a=${speciesA}&species_b=${speciesB}`, {
        method: "POST",
      });
      setAiExplanation(result);
    } catch (err) {
      setAiExplanation({ answer: null, error: err.message, mode: "error" });
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="Relasi Taksonomi"
        title="Bandingkan Dua Spesies"
        text="Sistem menilai kedekatan dari kesamaan kingdom, phylum, kelas, ordo, family, dan genus."
      />
      <section className="panel toolbar">
        <SpeciesSelect label="Spesies pertama" value={speciesA} options={optionsData.items} onChange={(value) => update("species_a", value)} />
        <SpeciesSelect label="Spesies kedua" value={speciesB} options={optionsData.items} onChange={(value) => update("species_b", value)} />
      </section>
      <StatusLine loading={loading} error={error} count={data.comparison.length} label="tingkat relasi" />
      {data.speciesA && data.speciesB && (
        <section className="comparison-panel">
          <div>
            <h2>{data.speciesA.indonesianName} vs {data.speciesB.indonesianName}</h2>
            <p className="latin">{data.speciesA.scientificName} · {data.speciesB.scientificName}</p>
          </div>
          <div className="comparison-side">
            <div className="conclusion">Kesimpulan: {data.conclusion}.</div>
            <button className="button primary" onClick={explainRelationshipWithAi} disabled={aiLoading} type="button">
              <Sparkles size={18} />
              {aiLoading ? "Meminta AI..." : "Jelaskan Hubungan dengan AI"}
            </button>
          </div>
        </section>
      )}
      <AIExplanationPanel explanation={aiExplanation} />
      <section className="table-card">
        <table>
          <thead>
            <tr>
              <th>Tingkat</th>
              <th>{data.speciesA?.indonesianName || "Spesies A"}</th>
              <th>{data.speciesB?.indonesianName || "Spesies B"}</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.comparison.map((row) => (
              <tr key={row.level}>
                <td>{row.level}</td>
                <td>{row.labelA}</td>
                <td>{row.labelB}</td>
                <td><span className={`pill ${row.same ? "good" : "neutral"}`}>{row.same ? "Sama" : "Berbeda"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <QueryBox query={data.sparql} />
    </div>
  );
}

function GraphPage() {
  const [params, setParams] = useSearchParams();
  const speciesId = params.get("species_id") || "";
  const { data: optionsData } = useApi("/api/species-options", { items: [] });
  const { data, loading, error } = useApi(`/api/graph${speciesId ? `?species_id=${speciesId}` : ""}`, {
    graph: { nodes: [], edges: [] },
    sparql: "",
  });

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="Visualisasi Knowledge Graph"
        title="Graph Spesies dan Takson"
        text="Node spesies dihubungkan ke kingdom, phylum, kelas, ordo, family, genus, dan kategori melalui RDF property."
      />
      <section className="panel toolbar">
        <SpeciesSelect
          label="Fokus spesies"
          value={speciesId}
          allowAll
          options={optionsData.items}
          onChange={(value) => {
            const next = new URLSearchParams(params);
            if (value) next.set("species_id", value);
            else next.delete("species_id");
            setParams(next);
          }}
        />
        <div className="legend">
          <span><i className="dot species" /> Species</span>
          <span><i className="dot family" /> Taxon</span>
          <span><i className="dot category" /> Category</span>
        </div>
      </section>
      <StatusLine loading={loading} error={error} count={data.graph.nodes.length} label="node" />
      <GraphCanvas graph={data.graph} />
      <QueryBox query={data.sparql} />
    </div>
  );
}

function GraphCanvas({ graph }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !graph.nodes.length) return undefined;

    let cy;
    let cancelled = false;

    import("cytoscape").then(({ default: cytoscape }) => {
      if (cancelled || !containerRef.current) return;

      cy = cytoscape({
        container: containerRef.current,
        elements: [
          ...graph.nodes.map((node) => ({ data: node })),
          ...graph.edges.map((edge) => ({ data: edge })),
        ],
        style: [
          {
            selector: "node",
            style: {
              "background-color": "#52616b",
              color: "#1f2a32",
              label: "data(label)",
              "font-size": 11,
              "text-wrap": "wrap",
              "text-max-width": 110,
              "text-valign": "bottom",
              "text-margin-y": 8,
              width: 34,
              height: 34,
            },
          },
          {
            selector: 'node[type = "Species"]',
            style: {
              "background-color": "#1d5f4a",
              shape: "round-rectangle",
              width: 44,
              height: 30,
              color: "#14211d",
              "font-weight": 700,
            },
          },
          {
            selector: 'node[focus = "true"]',
            style: {
              "background-color": "#b86b3d",
              "border-color": "#713c20",
              "border-width": 3,
            },
          },
          {
            selector: 'node[type = "Category"]',
            style: {
              "background-color": "#7b6bb0",
            },
          },
          {
            selector: "edge",
            style: {
              width: 1.4,
              "line-color": "#b8c2bd",
              "target-arrow-color": "#b8c2bd",
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
              label: "data(label)",
              "font-size": 9,
              color: "#63727c",
              "text-rotation": "autorotate",
            },
          },
        ],
        layout: {
          name: "cose",
          animate: false,
          padding: 40,
          nodeRepulsion: 8000,
          idealEdgeLength: 95,
        },
      });
    });

    return () => {
      cancelled = true;
      if (cy) cy.destroy();
    };
  }, [graph]);

  if (!graph.nodes.length) {
    return <div className="empty-state">Graph belum memiliki node untuk ditampilkan.</div>;
  }

  return <div className="graph-canvas" ref={containerRef} />;
}

function AIExplanationPanel({ explanation }) {
  if (!explanation) return null;

  return (
    <section className="ai-panel">
      <div>
        <p className="card-kicker">AI Explanation Assistant</p>
        <h2>Penjelasan Natural Language</h2>
        <p className="ai-note">
          Gemini hanya menerima konteks hasil SPARQL. Data utama tetap berasal dari RDF, ontologi, dan SPARQL endpoint.
        </p>
      </div>
      {explanation.answer ? (
        <p className="ai-answer">{explanation.answer}</p>
      ) : (
        <p className="inline-warning">{explanation.error || "AI belum menghasilkan penjelasan."}</p>
      )}
      {explanation.error && explanation.answer && <p className="inline-warning">Catatan: {explanation.error}</p>}
    </section>
  );
}

function SpeciesSelect({ label, value, options, onChange, allowAll = false }) {
  return (
    <label className="field wide">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {allowAll && <option value="">Semua data</option>}
        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {item.indonesianName} - {item.scientificName}
          </option>
        ))}
      </select>
    </label>
  );
}

function PageTitle({ eyebrow, title, text }) {
  return (
    <section className="page-title">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {text && <p>{text}</p>}
    </section>
  );
}

function SectionHeader({ title, text }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function InfoPanel({ title, rows }) {
  return (
    <article className="info-panel">
      <h2>{title}</h2>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function StatusLine({ loading, error, count, label = "entri" }) {
  return (
    <div className="status-line">
      <span>{loading ? "Memuat data..." : `${count} ${label}`}</span>
      {error && <span className="inline-warning">SPARQL error: {error}</span>}
    </div>
  );
}

function QueryBox({ query }) {
  if (!query) return null;
  return (
    <details className="query-box">
      <summary>SPARQL query</summary>
      <pre><code>{query}</code></pre>
    </details>
  );
}

export default App;
