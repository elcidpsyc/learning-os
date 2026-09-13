type DestilarResult = {
  title: string;
  tema: string;
  claims: string[];
  quote: { text: string; pagina: string } | null;
  comentario: string[];
  perguntasAbertas: string[];
  citacao: string;
  cards: { q: string; gabarito: string; paginas: string }[];
};

type SocraticResult = {
  feedback: string;
  acertou: boolean;
  distincao: string;
  proximaPergunta: string | null;
  profileNote: string;
};

type CompararResult = {
  pergunta: string;
  tabela: { fonte: string; afirma: string; pagina: string }[];
  concordam: string;
  divergem: string;
  palavrasIguais: string;
  evidencia: string;
  raciocinio: string;
};

export async function getAiStatus(): Promise<{ available: boolean }> {
  return { available: false };
}

export async function destilarComModelo(_input: {
  data: { fonteId: string; capitulo: string; paginas: string; recorte: string };
}): Promise<{ ok: false; error: string } | { ok: true; data: DestilarResult }> {
  return { ok: false, error: "AI is not available" };
}

export async function tutorSocratico(_input: { data: unknown }): Promise<
  { ok: false; error: string } | { ok: true; data: SocraticResult }
> {
  return { ok: false, error: "AI is not available" };
}

export async function compararFontes(_input: { data: unknown }): Promise<
  { ok: false; error: string } | { ok: true; data: CompararResult }
> {
  return { ok: false, error: "AI is not available" };
}
