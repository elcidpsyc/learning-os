import { lookupGlossary, looksPortuguese, type GlossHit } from "./glossary";
import { traduzirTrecho } from "./ai";

export type GlossResult = GlossHit & {
  source: "glossary" | "modelo" | "rede" | "local";
};

const memory = new Map<string, GlossResult>();

function keyOf(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function cacheGet(text: string): GlossResult | null {
  return memory.get(keyOf(text)) ?? null;
}

export function cacheSet(text: string, result: GlossResult): void {
  memory.set(keyOf(text), result);
}

async function fromNetwork(text: string): Promise<GlossResult | null> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 280))}&langpair=en|pt`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const body = (await res.json()) as {
    responseData?: { translatedText?: string };
    matches?: { translation?: string; quality?: string | number }[];
  };
  const main = body.responseData?.translatedText?.trim();
  if (!main) return null;
  const extras = (body.matches ?? [])
    .map((m) => (m.translation ?? "").trim())
    .filter((t) => t && t.toLowerCase() !== main.toLowerCase() && t.toLowerCase() !== text.toLowerCase())
    .slice(0, 3);
  const unique = [...new Map(extras.map((t) => [t.toLowerCase(), t])).values()];
  return {
    translation: main,
    literal: main,
    variations: unique.map((pt) => ({ pt, nota: "outra correspondência" })),
    source: "rede",
  };
}

export async function translateSelection(input: {
  text: string;
  context?: string;
}): Promise<GlossResult> {
  const text = input.text.trim().replace(/\s+/g, " ");
  if (text.length < 2) {
    return { translation: text, variations: [], source: "local" };
  }
  if (looksPortuguese(text) && !lookupGlossary(text)) {
    return {
      translation: text,
      literal: text,
      variations: [{ pt: text, nota: "já está em português" }],
      source: "local",
    };
  }
  const cached = cacheGet(text);
  if (cached) return cached;
  const glossary = lookupGlossary(text);
  if (glossary) {
    const hit: GlossResult = { ...glossary, source: "glossary" };
    cacheSet(text, hit);
    return hit;
  }
  try {
    const ai = await traduzirTrecho({ data: { text, context: input.context ?? "" } });
    if (ai.ok) {
      const hit: GlossResult = { ...ai.data, source: "modelo" };
      cacheSet(text, hit);
      return hit;
    }
  } catch {
    /* fallback */
  }
  try {
    const net = await fromNetwork(text);
    if (net) {
      cacheSet(text, net);
      return net;
    }
  } catch {
    /* offline */
  }
  return {
    translation: text,
    variations: [{ pt: text, nota: "sem tradução nesta rede — marque e complete depois" }],
    source: "local",
  };
}
