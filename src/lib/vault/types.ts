export type FonteId = "iyer-1926" | "kidd-1919" | "vidal-2011" | (string & {});

export type NoteStatus = "rascunho" | "estavel";

export type Note = {
  id: string;
  title: string;
  tema: string;
  fonte: FonteId;
  capitulo: string;
  paginas: string;
  data: string;
  status: NoteStatus;
  claims: string[];
  quote?: { text: string; pagina?: string };
  comentario: string[];
  ligacoes: {
    relaciona: string[];
    contradiz: string[];
    preRequisito: string[];
  };
  perguntasAbertas: string[];
  citacao: string;
};

export type ReviewCard = {
  id: string;
  tema: string;
  noteIds: string[];
  q: string;
  gabarito: string;
  fonte: FonteId;
  paginas: string;
  proxima: string;
  qualidade: 0 | 1 | 2 | 3 | 4;
  lastAttempt?: {
    at: string;
    text: string;
    qualidade: 1 | 2 | 3 | 4;
  };
};

export type MapNode = {
  id: string;
  tema: string;
  status: "aberto" | "parcial" | "destilado" | string;
  noteIds: string[];
};

export type MapEdge = {
  from: string;
  relation: string;
  to: string;
  supportedBy: string[];
};

export type ThemeMap = {
  nodes: MapNode[];
  edges: MapEdge[];
  contradictions: string[];
};

export type Profile = {
  updatedAt: string;
  intencao: string;
  jaTraz: string[];
  nivel: string;
  travas: string[];
  jaEntendeu: string[];
  filaPessoal: string[];
};

export type SourceChapter = {
  titulo: string;
  pagina: number | null;
  status: "destilado" | "pendente" | string;
};

export type Source = {
  id: FonteId;
  autor: string;
  obra: string;
  local: string;
  ano: number;
  edicao?: string;
  arquivo: string;
  paginasArquivo: number | null;
  mapeamento: string;
  capitulos: SourceChapter[];
};

export type Reasoning = {
  id: string;
  data: string;
  pergunta: string;
  tema: string;
  tabela: { fonte: string; afirma: string; pagina: string }[];
  concordam: string;
  divergem: string;
  palavrasIguais: string;
  evidencia: string;
  raciocinio: string;
};

export type ChatTurn = {
  id: string;
  role: "user" | "tutor" | "system";
  at: string;
  content: string;
};

export type StudyMode = "destilador" | "socratico" | "comparador";

export type GlossMark = {
  id: string;
  text: string;
  translation: string;
  literal?: string;
  variations: { pt: string; nota: string }[];
  noteId: string | null;
  field: string;
  createdAt: string;
};

export type VaultData = {
  version: number;
  generatedAt: string;
  domain: string;
  notes: Note[];
  cards: ReviewCard[];
  map: ThemeMap;
  profile: Profile;
  sources: Source[];
  reasoning: Reasoning[];
  marks: GlossMark[];
};

export const FONTE_LABEL: Record<string, string> = {
  "iyer-1926": "Iyer, 1926",
  "kidd-1919": "Kidd, 1919",
  "vidal-2011": "Vidal, 2011",
};

export const FONTE_OBRA: Record<string, string> = {
  "iyer-1926": "The Hidden Powers in Man",
  "kidd-1919": "The Science of Power",
  "vidal-2011": "The Sciences of the Soul",
};
