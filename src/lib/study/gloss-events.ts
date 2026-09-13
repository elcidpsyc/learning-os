import type { GlossMark } from "@/lib/vault/types";
import type { GlossResult } from "./translate";

export type GlossOpenDetail = {
  text: string;
  rect: { top: number; left: number; width: number; height: number };
  noteId: string | null;
  field: string;
  context?: string;
  existing?: GlossMark | null;
  preset?: GlossResult | null;
};

const EVENT = "learning-os-gloss";

export function openGlossPopup(detail: GlossOpenDetail): void {
  window.dispatchEvent(new CustomEvent(EVENT, { detail }));
}

export function onGlossOpen(handler: (detail: GlossOpenDetail) => void): () => void {
  const fn = (e: Event) => handler((e as CustomEvent<GlossOpenDetail>).detail);
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}
