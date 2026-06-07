export interface ApiPayload {
  error?: string | null;
}

export interface SpeciesListItem {
  id: string;
  scientificName: string;
  indonesianName: string;
  englishName: string;
  kingdomLabel: string;
  categoryLabel: string;
  phylumLabel?: string;
  classLabel?: string;
  orderLabel?: string;
  familyLabel: string;
  genusLabel: string;
  relation?: string;
}

export interface SpeciesDetail extends SpeciesListItem {
  phylumLabel: string;
  classLabel: string;
  orderLabel: string;
  scientificSynonyms?: string;
  sourceData: string;
}

export interface SpeciesOption {
  id: string;
  indonesianName: string;
  scientificName: string;
  kingdomLabel: string;
  categoryLabel: string;
}

export interface CategoriesResponse extends ApiPayload {
  categories: string[];
  sparql?: string;
}

export interface SpeciesListResponse extends ApiPayload {
  items: SpeciesListItem[];
  sparql: string;
}

export interface SpeciesOptionsResponse extends ApiPayload {
  items: SpeciesOption[];
  sparql?: string;
}

export interface SpeciesDetailResponse extends ApiPayload {
  item: SpeciesDetail | null;
  related: SpeciesListItem[];
  sparql: {
    detail: string;
    related: string;
  };
}

export interface ComparisonRow {
  level: string;
  labelA: string;
  labelB: string;
  same: boolean;
}

export interface CompareResponse extends ApiPayload {
  comparison: ComparisonRow[];
  conclusion: string;
  speciesA: SpeciesDetail | null;
  speciesB: SpeciesDetail | null;
  sparql: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  scientificName?: string;
  focus?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphResponse extends ApiPayload {
  graph: GraphData;
  sparql: string;
}

export interface AIExplanation {
  answer: string | null;
  error: string | null;
  mode: string;
}
