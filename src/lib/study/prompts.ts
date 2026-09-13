import type { Note, Profile, ReviewCard } from "@/lib/vault/types";

export const DESTILADOR_SYSTEM = `Você destila fonte. Não dá aula. Não compara ainda.
Regras:
- Trabalhe só o recorte pedido.
- Separe claim da fonte e comentário nosso.
- Não invente página. Se não tiver página do livro, cite capítulo e "PDF p.".
- Português nas notas. Cite o original em inglês quando a formulação importar.
- Iyer descreve fenômenos psíquicos do vocabulário de 1926: registrar como afirmação da fonte, não como fato científico.
- Kidd: isolar a tese psicológica da retórica política.
- Vidal é historiografia: árbitro de origem, não manual de poderes ocultos.
- Uma ideia por nota. Título curto. Claims em bullet. Máximo ~40 linhas equivalentes.
Responda APENAS JSON válido, sem markdown:
{
  "title": string,
  "tema": string,
  "claims": string[],
  "quote": { "text": string, "pagina": string } | null,
  "comentario": string[],
  "perguntasAbertas": string[],
  "citacao": string,
  "cards": [{ "q": string, "gabarito": string, "paginas": string }]
}
Gere 3 a 5 cards. Gabarito curto, com página.`;

export const SOCRATICO_SYSTEM = `Você é tutor socrático. Não despeja resumo.
Regras:
- Só pergunta a partir das notas já gravadas. Se faltar nota, diga qual capítulo destilar.
- Uma pergunta de cada vez.
- Depois da resposta: confirme o que acertou, corrija com citação (autor + obra + página), faça a próxima.
- Se o usuário errar, não entregue o parágrafo inteiro. Entregue a distinção que faltou + a página.
- Nunca escreva nota nova.
- Português.
Responda APENAS JSON válido:
{
  "feedback": string,
  "acertou": boolean,
  "distincao": string,
  "proximaPergunta": string | null,
  "profileNote": string
}`;

export const COMPARADOR_SYSTEM = `Você compara fontes já destiladas. Se faltar nota de um autor, pare e peça a destilação.
Não misture as vozes. Não declare vencedor.
Responda APENAS JSON válido:
{
  "pergunta": string,
  "tabela": [{ "fonte": string, "afirma": string, "pagina": string }],
  "concordam": string,
  "divergem": string,
  "palavrasIguais": string,
  "evidencia": string,
  "raciocinio": string
}`;

export function destilarUserPrompt(input: {
  fonteId: string;
  capitulo: string;
  paginas: string;
  recorte: string;
}): string {
  return `Obra: ${input.fonteId}
Capítulo: ${input.capitulo}
Páginas: ${input.paginas}

Recorte:
${input.recorte.slice(0, 12000)}`;
}

export function socraticUserPrompt(input: {
  notes: Note[];
  card: ReviewCard | null;
  history: { role: string; content: string }[];
  answer: string;
  profile: Profile;
}): string {
  const notesBlock = input.notes
    .map(
      (n) =>
        `# ${n.title}\nFonte: ${n.fonte} p. ${n.paginas}\nClaims:\n${n.claims.map((c) => `- ${c}`).join("\n")}\nCitação: ${n.citacao}`,
    )
    .join("\n\n")
    .slice(0, 8000);
  const hist = input.history
    .slice(-6)
    .map((h) => `${h.role}: ${h.content}`)
    .join("\n");
  return `Notas disponíveis:
${notesBlock}

Card atual: ${input.card ? `${input.card.q} | gabarito (interno): ${input.card.gabarito}` : "nenhum"}

Perfil: nível ${input.profile.nivel}. Já entendeu: ${input.profile.jaEntendeu.join("; ") || "ainda pouco"}.

Histórico:
${hist}

Resposta do aprendiz:
${input.answer}`;
}

export function compararUserPrompt(input: { tema: string; notes: Note[] }): string {
  const block = input.notes
    .map(
      (n) =>
        `${n.fonte} | ${n.title} | p. ${n.paginas}\n${n.claims.map((c) => `- ${c}`).join("\n")}`,
    )
    .join("\n\n")
    .slice(0, 8000);
  return `Tema: ${input.tema}

Notas:
${block || "(nenhuma nota neste tema)"}`;
}
