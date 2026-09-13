import type { Note, Reasoning, ReviewCard, VaultData } from "@/lib/vault/types";
import { FONTE_LABEL, FONTE_OBRA } from "@/lib/vault/types";

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function paragraphs(text: string): string[] {
  return text
    .split(/\n{2,}|\r\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export function organizeNoteTemplate(input: {
  fonteId: string;
  capitulo: string;
  paginas: string;
  recorte: string;
}): { note: Note; cards: ReviewCard[] } {
  const parts = paragraphs(input.recorte);
  const quote = parts[0] ?? input.recorte.trim();
  const claims =
    parts.length > 1
      ? parts.slice(0, 8)
      : quote
          .split(/(?<=[.!?])\s+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 40)
          .slice(0, 6);
  const id = `${input.fonteId}-${slug(input.capitulo || "recorte")}-${Date.now()}`;
  const title = input.capitulo
    ? `${input.capitulo}: recorte organizado`
    : "Recorte organizado (sem modelo)";
  const fonteLabel = FONTE_LABEL[input.fonteId] ?? input.fonteId;
  const obra = FONTE_OBRA[input.fonteId] ?? input.fonteId;
  const note: Note = {
    id,
    title,
    tema: "psyche",
    fonte: input.fonteId,
    capitulo: input.capitulo || "sem capítulo",
    paginas: input.paginas || "sem página",
    data: todayIso(),
    status: "rascunho",
    claims: claims.length ? claims : [quote.slice(0, 400)],
    quote: quote ? { text: quote.slice(0, 900), pagina: input.paginas } : undefined,
    comentario: [
      "Organizado no formato da nota, sem destilação por modelo. Separe claim da fonte e comentário na próxima passagem.",
    ],
    ligacoes: { relaciona: [], contradiz: [], preRequisito: [] },
    perguntasAbertas: [
      "O que a fonte afirma, em uma frase?",
      "Isso é evidência, anedota ou definição?",
    ],
    citacao: `${fonteLabel}. ${obra}, p. ${input.paginas || "?"}.`,
  };
  const cards: ReviewCard[] = [
    {
      id: `card-${id}-1`,
      tema: note.tema,
      noteIds: [id],
      q: `O que ${fonteLabel} afirma neste recorte de ${note.capitulo}?`,
      gabarito: note.claims.slice(0, 3).join(" "),
      fonte: input.fonteId,
      paginas: note.paginas,
      proxima: todayIso(),
      qualidade: 0,
    },
    {
      id: `card-${id}-2`,
      tema: note.tema,
      noteIds: [id],
      q: `Qual a citação (obra + página) deste recorte?`,
      gabarito: note.citacao,
      fonte: input.fonteId,
      paginas: note.paginas,
      proxima: todayIso(),
      qualidade: 0,
    },
    {
      id: `card-${id}-3`,
      tema: note.tema,
      noteIds: [id],
      q: `Isto é claim da fonte ou comentário nosso? Resuma o recorte em uma linha.`,
      gabarito: `Claim da fonte (rascunho). ${note.claims[0] ?? ""}`,
      fonte: input.fonteId,
      paginas: note.paginas,
      proxima: todayIso(),
      qualidade: 0,
    },
  ];
  return { note, cards };
}

export function nextDueCard(cards: ReviewCard[], afterId?: string | null): ReviewCard | null {
  if (!cards.length) return null;
  const today = todayIso();
  const due = cards.filter((c) => c.proxima <= today);
  const pool = due.length ? due : cards;
  if (afterId) {
    const i = pool.findIndex((c) => c.id === afterId);
    if (i >= 0) return pool[(i + 1) % pool.length] ?? pool[0];
  }
  const untried = pool.find((c) => c.qualidade === 0);
  return untried ?? pool[0];
}

export function socraticOfflinePrompt(card: ReviewCard): string {
  return card.q;
}

export function compareOffline(vault: Pick<VaultData, "notes" | "sources">, tema: string): Reasoning {
  const notes = vault.notes.filter((n) => n.tema === tema);
  const byFonte = new Map<string, Note[]>();
  for (const n of notes) {
    const list = byFonte.get(n.fonte) ?? [];
    list.push(n);
    byFonte.set(n.fonte, list);
  }
  const wanted = ["iyer-1926", "kidd-1919", "vidal-2011"];
  const missing = wanted.filter((id) => !byFonte.has(id));
  const tabela = wanted.map((id) => {
    const ns = byFonte.get(id);
    if (!ns?.length) {
      return {
        fonte: FONTE_LABEL[id] ?? id,
        afirma: "Sem nota destilada. Pare e destile este autor antes de comparar.",
        pagina: "—",
      };
    }
    return {
      fonte: FONTE_LABEL[id] ?? id,
      afirma: ns.map((n) => `${n.title}: ${n.claims[0] ?? ""}`).join(" "),
      pagina: ns.map((n) => n.paginas).join("; "),
    };
  });
  return {
    id: `reason-${tema}-${Date.now()}`,
    data: todayIso(),
    pergunta: `O que cada fonte afirma sobre o tema “${tema}”?`,
    tema,
    tabela,
    concordam: notes.length < 2 ? "Ainda não há duas vozes para concordar." : "Ver tabela — não fundir as vozes.",
    divergem: missing.length
      ? `Falta destilar: ${missing.map((id) => FONTE_LABEL[id]).join(", ")}.`
      : "Marque divergência só onde a mesma pergunta é respondida de modos diferentes.",
    palavrasIguais:
      "Cuidado: psychic / psyché / psychology não são a mesma palavra nas três obras.",
    evidencia: notes
      .map((n) => `${FONTE_LABEL[n.fonte]}: anedota/definição no recorte p. ${n.paginas}.`)
      .join(" "),
    raciocinio: missing.length
      ? "Não há vencedor. Destile as fontes que faltam; depois volte."
      : "Leia a tabela em voz alta. Uma linha por autor. Não misture.",
  };
}

export function formatNoteAsMarkdown(note: Note): string {
  return [
    `# ${note.title}`,
    "",
    `Tema: ${note.tema} · ${FONTE_LABEL[note.fonte] ?? note.fonte} · p. ${note.paginas}`,
    "",
    "## Claim da fonte",
    ...note.claims.map((c) => `- ${c}`),
    "",
    note.quote ? `## Palavras do autor\n> ${note.quote.text}` : "",
    "",
    "## Comentário nosso",
    ...note.comentario.map((c) => `- ${c}`),
    "",
    "## Citação",
    note.citacao,
  ]
    .filter((line) => line !== "")
    .join("\n");
}
