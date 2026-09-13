import { create } from "zustand";
import seedJson from "@/data/seed.json";
import type { Note, Profile, Reasoning, ReviewCard, StudyMode, VaultData } from "./types";

const SEED = seedJson as VaultData;
const STORAGE_KEY = "learning-os-vault-v1";

type TabId = "estudar" | "notas" | "revisar" | "mapa" | "fontes";

type VaultState = VaultData & {
  tab: TabId;
  mode: StudyMode;
  hydrated: boolean;
  selectedNoteId: string | null;
  activeCardId: string | null;
  setTab: (tab: TabId) => void;
  setMode: (mode: StudyMode) => void;
  selectNote: (id: string | null) => void;
  setActiveCard: (id: string | null) => void;
  upsertNote: (note: Note) => void;
  addCards: (cards: ReviewCard[]) => void;
  recordAttempt: (cardId: string, text: string, qualidade: 1 | 2 | 3 | 4) => void;
  addReasoning: (entry: Reasoning) => void;
  patchProfile: (patch: Partial<Profile>) => void;
  attachNoteToMap: (nodeId: string, noteId: string) => void;
  markSourceChapter: (fonteId: string, capitulo: string) => void;
  replaceVault: (data: VaultData) => void;
  restoreSeed: () => void;
  exportVault: () => VaultData;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function cloneSeed(): VaultData {
  return structuredClone(SEED);
}

function snapshot(s: VaultState): VaultData {
  return {
    version: s.version,
    generatedAt: todayIso(),
    domain: s.domain,
    notes: s.notes,
    cards: s.cards,
    map: s.map,
    profile: s.profile,
    sources: s.sources,
    reasoning: s.reasoning,
  };
}

function writeVault(data: VaultData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota */
  }
}

function readVault(): VaultData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VaultData;
    if (!Array.isArray(parsed.notes) || !Array.isArray(parsed.cards)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export const useVault = create<VaultState>((set, get) => ({
  ...cloneSeed(),
  tab: "estudar",
  mode: "socratico",
  hydrated: true,
  selectedNoteId: null,
  activeCardId: SEED.cards[0]?.id ?? null,
  setTab: (tab) => set({ tab }),
  setMode: (mode) => set({ mode }),
  selectNote: (id) => set({ selectedNoteId: id, tab: id ? "notas" : get().tab }),
  setActiveCard: (id) => set({ activeCardId: id }),
  upsertNote: (note) => {
    set((s) => {
      const idx = s.notes.findIndex((n) => n.id === note.id);
      const notes = idx >= 0 ? s.notes.map((n) => (n.id === note.id ? note : n)) : [note, ...s.notes];
      const nodes = s.map.nodes.map((node) =>
        node.id === note.tema && !node.noteIds.includes(note.id)
          ? {
              ...node,
              noteIds: [...node.noteIds, note.id],
              status: node.noteIds.length + 1 >= 3 ? "destilado" : "parcial",
            }
          : node,
      );
      return { notes, map: { ...s.map, nodes } };
    });
    writeVault(snapshot(get()));
  },
  addCards: (cards) => {
    set((s) => ({
      cards: [...cards.filter((c) => !s.cards.some((x) => x.id === c.id)), ...s.cards],
      activeCardId: cards[0]?.id ?? s.activeCardId,
    }));
    writeVault(snapshot(get()));
  },
  recordAttempt: (cardId, text, qualidade) => {
    set((s) => ({
      cards: s.cards.map((c) =>
        c.id !== cardId
          ? c
          : {
              ...c,
              qualidade,
              lastAttempt: { at: new Date().toISOString(), text, qualidade },
              proxima: addDays(qualidade >= 3 ? 3 : qualidade === 2 ? 1 : 0),
            },
      ),
      profile: {
        ...s.profile,
        updatedAt: todayIso(),
        jaEntendeu:
          qualidade >= 3 && !s.profile.jaEntendeu.some((x) => x.includes(cardId))
            ? [...s.profile.jaEntendeu, `Card ${cardId} respondido com qualidade ${qualidade}.`]
            : s.profile.jaEntendeu,
        travas:
          qualidade === 1
            ? [...s.profile.travas.filter((t) => !t.includes(cardId)), `Travou no card ${cardId}.`]
            : s.profile.travas,
      },
    }));
    writeVault(snapshot(get()));
  },
  addReasoning: (entry) => {
    set((s) => ({ reasoning: [entry, ...s.reasoning] }));
    writeVault(snapshot(get()));
  },
  patchProfile: (patch) => {
    set((s) => ({ profile: { ...s.profile, ...patch, updatedAt: todayIso() } }));
    writeVault(snapshot(get()));
  },
  attachNoteToMap: (nodeId, noteId) => {
    set((s) => ({
      map: {
        ...s.map,
        nodes: s.map.nodes.map((n) =>
          n.id === nodeId && !n.noteIds.includes(noteId) ? { ...n, noteIds: [...n.noteIds, noteId] } : n,
        ),
      },
    }));
    writeVault(snapshot(get()));
  },
  markSourceChapter: (fonteId, capitulo) => {
    set((s) => ({
      sources: s.sources.map((src) =>
        src.id !== fonteId
          ? src
          : {
              ...src,
              capitulos: src.capitulos.map((ch) =>
                ch.titulo.toLowerCase().includes(capitulo.toLowerCase()) ? { ...ch, status: "destilado" } : ch,
              ),
            },
      ),
    }));
    writeVault(snapshot(get()));
  },
  replaceVault: (data) => {
    set({
      ...data,
      tab: get().tab,
      mode: get().mode,
      hydrated: true,
      selectedNoteId: data.notes[0]?.id ?? null,
      activeCardId: data.cards[0]?.id ?? null,
    });
    writeVault(data);
  },
  restoreSeed: () => {
    const seed = cloneSeed();
    set({
      ...seed,
      tab: "notas",
      mode: "socratico",
      hydrated: true,
      selectedNoteId: seed.notes[0]?.id ?? null,
      activeCardId: seed.cards[0]?.id ?? null,
    });
    writeVault(seed);
  },
  exportVault: () => snapshot(get()),
}));

export function hydrateVault(): void {
  if (typeof window === "undefined") return;
  const saved = readVault();
  if (!saved) return;
  useVault.setState({
    ...saved,
    hydrated: true,
    activeCardId: saved.cards[0]?.id ?? null,
  });
}

export type { TabId };
export { SEED };
