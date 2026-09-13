export type GlossVariation = { pt: string; nota: string };

export type GlossHit = {
  translation: string;
  literal?: string;
  variations: GlossVariation[];
};

function n(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[“”"‘’]/g, "")
    .replace(/\s+/g, " ");
}

const ENTRIES: Record<string, GlossHit> = {
  vision: {
    translation: "visão (extática)",
    literal: "visão",
    variations: [
      { pt: "visão", nota: "sentido comum: o que o olho vê" },
      { pt: "visão extática", nota: "Iyer: imagem sem o olho físico, em êxtase" },
    ],
  },
  visions: {
    translation: "visões (extáticas)",
    literal: "visões",
    variations: [
      { pt: "visões", nota: "plural de vision" },
      { pt: "visões fugazes", nota: "fleeting images ao adormecer ou despertar" },
    ],
  },
  "fleeting images": {
    translation: "imagens fugazes",
    literal: "imagens passageiras",
    variations: [{ pt: "imagens fugazes", nota: "Iyer: ao adormecer, despertar ou (raro) acordado" }],
  },
  hallucination: {
    translation: "alucinação",
    literal: "alucinação",
    variations: [
      { pt: "alucinação", nota: "Iyer: visão do insano; coisa que não existe" },
      { pt: "delírio de percepção", nota: "definição do Preface: delusions of perceptions" },
    ],
  },
  hallucinations: {
    translation: "alucinações",
    literal: "alucinações",
    variations: [
      { pt: "alucinações", nota: "Iyer recusa chamar de visões quando o vidente é insano" },
    ],
  },
  "delusions of perceptions of things that do not exist": {
    translation: "delírios de percepção de coisas que não existem",
    literal: "ilusões de percepção de coisas inexistentes",
    variations: [{ pt: "delírio perceptivo", nota: "definição de hallucination no Preface" }],
  },
  delusion: {
    translation: "delírio",
    literal: "delusão / engano",
    variations: [
      { pt: "delírio", nota: "uso clínico" },
      { pt: "engano", nota: "sentido amplo" },
    ],
  },
  delusions: {
    translation: "delírios",
    literal: "delusões",
    variations: [{ pt: "delírios", nota: "Iyer junta a hallucination neste parágrafo" }],
  },
  illusion: {
    translation: "ilusão",
    literal: "ilusão",
    variations: [
      { pt: "ilusão", nota: "Iyer: aparência enganosa, muitas vezes coletiva" },
      { pt: "jalam / Indra-jalam", nota: "termo sânscrito que ele cita para mágica" },
    ],
  },
  illusions: {
    translation: "ilusões",
    literal: "ilusões",
    variations: [{ pt: "ilusões", nota: "o mágico faz a plateia ver o que a fotografia desmente" }],
  },
  jalam: {
    translation: "jalam (mágica / ilusão)",
    literal: "jalam",
    variations: [{ pt: "Indra-jalam", nota: "manter o sânscrito; é o nome da aparência, não traduzir por ‘truque’ só" }],
  },
  "indra-jalam": {
    translation: "Indra-jalam (ilusionismo)",
    literal: "Indra-jalam",
    variations: [{ pt: "magia de Indra", nota: "tradução escolar; Iyer usa o composto" }],
  },
  trance: {
    translation: "transe",
    literal: "transe",
    variations: [
      { pt: "transe", nota: "estado induzido: droga, hipnose, devoção, crystal gazing…" },
      { pt: "êxtase", nota: "não é sinônimo: êxtase pode trazer visão; trance é o estado" },
    ],
  },
  mesmerism: {
    translation: "mesmerismo",
    literal: "mesmerismo",
    variations: [
      { pt: "mesmerismo", nota: "Iyer: magnetismo animal — emanações do operador" },
      { pt: "magnetismo animal", nota: "vocabulário de Mesmer que Iyer cita" },
    ],
  },
  hypnotism: {
    translation: "hipnotismo",
    literal: "hipnotismo",
    variations: [
      { pt: "hipnotismo", nota: "resultados parecidos; Iyer atribui ao sujeito, não às emanações" },
      { pt: "hipnose", nota: "termo atual; a fonte diz hypnotism" },
    ],
  },
  "animal magnetism": {
    translation: "magnetismo animal",
    literal: "magnetismo animal",
    variations: [{ pt: "mesmerismo", nota: "Iyer trata como emanações do corpo do operador" }],
  },
  "crystal gazing": {
    translation: "cristaloscopia / olhar o cristal",
    literal: "contemplação de cristal",
    variations: [{ pt: "gaze de cristal", nota: "gatilho de trance no Preface" }],
  },
  bhakti: {
    translation: "bhakti (devoção)",
    literal: "bhakti",
    variations: [
      { pt: "bhakti", nota: "manter o sânscrito: via devocional" },
      { pt: "devoção", nota: "aproximação; perde o termo técnico" },
    ],
  },
  bakthi: {
    translation: "bhakti (devoção)",
    literal: "Bakthi (grafia de Iyer)",
    variations: [{ pt: "bhakti", nota: "Iyer escreve Bakthi; é o mesmo termo" }],
  },
  ecstasy: {
    translation: "êxtase",
    literal: "êxtase",
    variations: [{ pt: "êxtase religioso", nota: "condição favorável às visões, segundo Iyer" }],
  },
  ecstacy: {
    translation: "êxtase",
    literal: "êxtase (grafia da edição)",
    variations: [{ pt: "êxtase", nota: "Iyer / OCR: ecstacy = ecstasy" }],
  },
  "religious ecstacy": {
    translation: "êxtase religioso",
    literal: "êxtase religioso",
    variations: [{ pt: "êxtase de bhakti", nota: "condição favorável para visions no Preface" }],
  },
  "religious ecstasy": {
    translation: "êxtase religioso",
    literal: "êxtase religioso",
    variations: [{ pt: "êxtase de bhakti", nota: "condição favorável para visions no Preface" }],
  },
  insane: {
    translation: "insano / alienado",
    literal: "insano",
    variations: [
      { pt: "insano", nota: "vocabulário de 1926; não importar diagnóstico atual" },
      { pt: "louco", nota: "Iyer usa no exemplo do homem-pão" },
    ],
  },
  "waking hours": {
    translation: "horas de vigília",
    literal: "horas acordado",
    variations: [{ pt: "em vigília", nota: "oposto de adormecer / trance" }],
  },
  awake: {
    translation: "acordado / em vigília",
    literal: "acordado",
    variations: [{ pt: "em vigília", nota: "Iyer opõe a sleep e a trance" }],
  },
  "longing or desire": {
    translation: "anseio ou desejo",
    literal: "longing ou desire",
    variations: [{ pt: "objeto da ânsia", nota: "não precisa ser nobre, diz Iyer" }],
  },
  psyche: {
    translation: "psyché / psique",
    literal: "psique",
    variations: [
      { pt: "psyché", nota: "manter quando for a palavra grega da origem (Vidal)" },
      { pt: "psique", nota: "português corrente" },
      { pt: "alma", nota: "não fundir com psychology — Vidal disputa essa origem" },
    ],
  },
  "psyché": {
    translation: "psyché",
    literal: "psyché",
    variations: [{ pt: "psique / alma", nota: "Vidal: não é automaticamente ‘psychology’" }],
  },
  psychology: {
    translation: "psicologia",
    literal: "psicologia",
    variations: [
      { pt: "psicologia", nota: "disciplina moderna" },
      { pt: "sciences of the soul", nota: "Vidal: origem early modern, não o uso popular" },
    ],
  },
  power: {
    translation: "poder",
    literal: "poder",
    variations: [
      { pt: "poder", nota: "Kidd: sobretudo emoção coletiva, não razão" },
      { pt: "potência", nota: "quando for thought-power em Iyer" },
    ],
  },
  "thought-power": {
    translation: "poder do pensamento",
    literal: "poder do pensamento",
    variations: [{ pt: "força do pensamento", nota: "capítulo Thought and its Power" }],
  },
  emotion: {
    translation: "emoção",
    literal: "emoção",
    variations: [{ pt: "emoção coletiva", nota: "tese de Kidd sobre power" }],
  },
  reason: {
    translation: "razão",
    literal: "razão",
    variations: [{ pt: "razão", nota: "Kidd separa power da reason" }],
  },
  soul: {
    translation: "alma",
    literal: "alma",
    variations: [
      { pt: "alma", nota: "Vidal: sciences of the soul" },
      { pt: "psyché", nota: "não misturar com o uso de Iyer" },
    ],
  },
  perception: {
    translation: "percepção",
    literal: "percepção",
    variations: [{ pt: "percepção", nota: "em hallucination: percepção de coisa inexistente" }],
  },
  perceptions: {
    translation: "percepções",
    literal: "percepções",
    variations: [{ pt: "percepções", nota: "delusions of perceptions no Preface" }],
  },
  concentration: {
    translation: "concentração",
    literal: "concentração",
    variations: [{ pt: "concentração intensa", nota: "um dos gatilhos de visão / trance" }],
  },
  devotion: {
    translation: "devoção",
    literal: "devoção",
    variations: [{ pt: "bhakti", nota: "quando Iyer fala da via religiosa" }],
  },
  hypnotic: {
    translation: "hipnótico",
    literal: "hipnótico",
    variations: [{ pt: "hipnótico", nota: "ligado a hypnotism, não a mesmerism" }],
  },
  emanations: {
    translation: "emanações",
    literal: "emanações",
    variations: [{ pt: "emanações do operador", nota: "o que Iyer atribui ao mesmerismo" }],
  },
  oblivion: {
    translation: "olvido / esquecimento das dores",
    literal: "olvido",
    variations: [{ pt: "esquecimento", nota: "um fim do trance no Preface" }],
  },
};

const KEYS = Object.keys(ENTRIES).sort((a, b) => b.length - a.length);

export function lookupGlossary(text: string): GlossHit | null {
  const key = n(text);
  if (!key) return null;
  if (ENTRIES[key]) return ENTRIES[key];
  const stripped = key.replace(/[.,;:!?()[\]]+$/g, "").replace(/^[.,;:!?()[\]]+/g, "");
  if (stripped !== key && ENTRIES[stripped]) return ENTRIES[stripped];
  for (const k of KEYS) {
    if (k.length >= 8 && key === k) return ENTRIES[k];
  }
  return null;
}

export function looksPortuguese(text: string): boolean {
  const t = text.trim();
  if (/[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(t)) return true;
  return /\b(não|são|uma|que|pelo|pela|visão|alucinação|ilusão|transe|também|quando)\b/i.test(t);
}
