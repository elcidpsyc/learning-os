import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { compararFontes, destilarComModelo, tutorSocratico } from "@/lib/study/ai";
import { compareOffline, nextDueCard, organizeNoteTemplate } from "@/lib/study/offline";
import { cn } from "@/lib/utils";
import { useVault } from "@/lib/vault/store";
import type { ChatTurn, StudyMode } from "@/lib/vault/types";
import { FONTE_LABEL } from "@/lib/vault/types";

const MODES: { id: StudyMode; label: string; hint: string }[] = [
  { id: "destilador", label: "Destilar", hint: "Recorte + página → nota" },
  { id: "socratico", label: "Socrático", hint: "Uma pergunta por vez" },
  { id: "comparador", label: "Comparar", hint: "Cruzar fontes já destiladas" },
];

export function StudyTab({ aiOn }: { aiOn: boolean }) {
  const mode = useVault((s) => s.mode);
  const setMode = useVault((s) => s.setMode);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-paper-2 p-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={cn(
              "min-h-11 rounded-lg px-1 text-sm font-medium transition-colors duration-[var(--motion-quick)]",
              mode === m.id ? "bg-surface text-fg shadow-sm" : "text-muted",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted">{MODES.find((m) => m.id === mode)?.hint}</p>
      {mode === "destilador" ? <DestilarForm aiOn={aiOn} /> : null}
      {mode === "socratico" ? <SocraticPanel aiOn={aiOn} /> : null}
      {mode === "comparador" ? <CompararPanel aiOn={aiOn} /> : null}
    </div>
  );
}

function DestilarForm({ aiOn }: { aiOn: boolean }) {
  const upsertNote = useVault((s) => s.upsertNote);
  const addCards = useVault((s) => s.addCards);
  const markSourceChapter = useVault((s) => s.markSourceChapter);
  const setTab = useVault((s) => s.setTab);
  const selectNote = useVault((s) => s.selectNote);
  const [fonteId, setFonteId] = useState("iyer-1926");
  const [capitulo, setCapitulo] = useState("Preface");
  const [paginas, setPaginas] = useState("");
  const [recorte, setRecorte] = useState("");
  const [busy, setBusy] = useState(false);

  async function onDestilar() {
    if (!recorte.trim()) {
      toast.error("Cole um recorte e a página.");
      return;
    }
    setBusy(true);
    try {
      if (aiOn) {
        const res = await destilarComModelo({
          data: { fonteId, capitulo, paginas, recorte },
        });
        if (!res.ok) {
          toast.message(res.error === "AI is not available" ? "Sem modelo neste aparelho. Organizei no template." : res.error);
          saveTemplate();
          return;
        }
        const id = `${fonteId}-${Date.now()}`;
        const note = {
          id,
          title: res.data.title,
          tema: res.data.tema || "psyche",
          fonte: fonteId,
          capitulo,
          paginas: paginas || "?",
          data: new Date().toISOString().slice(0, 10),
          status: "estavel" as const,
          claims: res.data.claims ?? [],
          quote: res.data.quote ?? undefined,
          comentario: res.data.comentario ?? [],
          ligacoes: { relaciona: [], contradiz: [], preRequisito: [] },
          perguntasAbertas: res.data.perguntasAbertas ?? [],
          citacao: res.data.citacao,
        };
        const cards = (res.data.cards ?? []).map((c, i) => ({
          id: `card-${id}-${i}`,
          tema: note.tema,
          noteIds: [id],
          q: c.q,
          gabarito: c.gabarito,
          fonte: fonteId,
          paginas: c.paginas || paginas,
          proxima: new Date().toISOString().slice(0, 10),
          qualidade: 0 as const,
        }));
        upsertNote(note);
        addCards(cards);
        markSourceChapter(fonteId, capitulo);
        selectNote(id);
        toast.success("Nota gravada com citação.");
        setTab("notas");
      } else {
        saveTemplate();
      }
    } catch {
      saveTemplate();
    } finally {
      setBusy(false);
    }
  }

  function saveTemplate() {
    const { note, cards } = organizeNoteTemplate({ fonteId, capitulo, paginas, recorte });
    upsertNote(note);
    addCards(cards);
    markSourceChapter(fonteId, capitulo);
    selectNote(note.id);
    toast.success("Recorte organizado no formato da nota. Sem modelo: revise os claims.");
    setTab("notas");
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        void onDestilar();
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="obra">Obra</Label>
        <select
          id="obra"
          value={fonteId}
          onChange={(e) => setFonteId(e.target.value)}
          className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-base text-fg"
        >
          <option value="iyer-1926">Iyer — Hidden Powers (1926)</option>
          <option value="kidd-1919">Kidd — Science of Power (1919)</option>
          <option value="vidal-2011">Vidal — Sciences of the Soul (2011)</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="cap">Capítulo</Label>
          <Input id="cap" value={capitulo} onChange={(e) => setCapitulo(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pag">Página do livro</Label>
          <Input id="pag" inputMode="numeric" placeholder="ex. 9–12" value={paginas} onChange={(e) => setPaginas(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="recorte">Recorte colado</Label>
        <Textarea
          id="recorte"
          placeholder="Cole o trecho. Não envie o PDF inteiro."
          value={recorte}
          onChange={(e) => setRecorte(e.target.value)}
        />
      </div>
      {!aiOn ? (
        <p className="rounded-xl border border-border bg-surface px-3 py-3 text-sm text-muted">
          Sem chave de modelo neste aparelho. Cole o recorte e eu organizo no formato da nota.
        </p>
      ) : null}
      <Button type="submit" disabled={busy}>
        {busy ? "Destilando…" : aiOn ? "Destilar" : "Organizar no formato"}
      </Button>
    </form>
  );
}

function SocraticPanel({ aiOn }: { aiOn: boolean }) {
  const notes = useVault((s) => s.notes);
  const cards = useVault((s) => s.cards);
  const profile = useVault((s) => s.profile);
  const activeCardId = useVault((s) => s.activeCardId);
  const setActiveCard = useVault((s) => s.setActiveCard);
  const recordAttempt = useVault((s) => s.recordAttempt);
  const patchProfile = useVault((s) => s.patchProfile);
  const card = useMemo(
    () => cards.find((c) => c.id === activeCardId) ?? nextDueCard(cards),
    [cards, activeCardId],
  );
  const [turns, setTurns] = useState<ChatTurn[]>(() => [
    {
      id: "t0",
      role: "tutor",
      at: new Date().toISOString(),
      content: card
        ? card.q
        : "Não há notas ainda. Destile um capítulo primeiro.",
    },
  ]);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [revealed, setRevealed] = useState(false);

  async function send() {
    if (!answer.trim() || !card) return;
    const userTurn: ChatTurn = {
      id: `u-${Date.now()}`,
      role: "user",
      at: new Date().toISOString(),
      content: answer.trim(),
    };
    setTurns((t) => [...t, userTurn]);
    setAnswer("");
    setBusy(true);
    try {
      if (aiOn) {
        const slimNotes = notes
          .filter((n) => !card.noteIds.length || card.noteIds.includes(n.id))
          .map((n) => ({
            ...n,
            quote: n.quote ? { text: n.quote.text.slice(0, 400), pagina: n.quote.pagina } : undefined,
          }));
        const res = await tutorSocratico({
          data: {
            notes: slimNotes,
            card: {
              id: card.id,
              tema: card.tema,
              noteIds: card.noteIds,
              q: card.q,
              gabarito: card.gabarito,
              fonte: card.fonte,
              paginas: card.paginas,
              proxima: card.proxima,
              qualidade: card.qualidade,
            },
            history: [...turns, userTurn].slice(-6).map((x) => ({ role: x.role, content: x.content })),
            answer: userTurn.content,
            profile: {
              updatedAt: profile.updatedAt,
              intencao: profile.intencao,
              jaTraz: profile.jaTraz,
              nivel: profile.nivel,
              travas: profile.travas.slice(-5),
              jaEntendeu: profile.jaEntendeu.slice(-8),
              filaPessoal: profile.filaPessoal.slice(0, 6),
            },
          },
        });
        if (!res.ok) {
          offlineReveal(userTurn.content);
          return;
        }
        setRevealed(true);
        setTurns((t) => [
          ...t,
          {
            id: `a-${Date.now()}`,
            role: "tutor",
            at: new Date().toISOString(),
            content: `${res.data.feedback}${res.data.distincao ? `\n\n${res.data.distincao}` : ""}`,
          },
        ]);
        recordAttempt(card.id, userTurn.content, res.data.acertou ? 3 : 1);
        if (res.data.profileNote) {
          patchProfile({
            jaEntendeu: res.data.acertou
              ? [...profile.jaEntendeu, res.data.profileNote]
              : profile.jaEntendeu,
            travas: res.data.acertou ? profile.travas : [...profile.travas, res.data.profileNote],
          });
        }
      } else {
        offlineReveal(userTurn.content);
      }
    } catch {
      offlineReveal(userTurn.content);
    } finally {
      setBusy(false);
    }
  }

  function offlineReveal(text: string) {
    if (!card) return;
    setRevealed(true);
    setTurns((t) => [
      ...t,
      {
        id: `a-${Date.now()}`,
        role: "tutor",
        at: new Date().toISOString(),
        content: "Resposta registrada. Compare com o gabarito curto (só agora) e marque a qualidade na aba Revisar se quiser notas de 1 a 4.",
      },
    ]);
    recordAttempt(card.id, text, 2);
  }

  function nextQuestion() {
    const nxt = nextDueCard(cards, card?.id);
    setRevealed(false);
    setActiveCard(nxt?.id ?? null);
    setTurns([
      {
        id: `t-${Date.now()}`,
        role: "tutor",
        at: new Date().toISOString(),
        content: nxt?.q ?? "Fila vazia. Destile outro recorte.",
      },
    ]);
  }

  return (
    <div className="flex flex-col gap-4">
      {!aiOn ? (
        <p className="text-sm text-muted">
          Sem modelo: o socrático usa a fila de cards. O gabarito só aparece depois que você enviar.
        </p>
      ) : null}
      <div className="flex flex-col gap-3">
        {turns.map((t) => (
          <div
            key={t.id}
            className={cn(
              "rounded-xl px-4 py-3 text-base leading-normal",
              t.role === "user" ? "ml-6 bg-primary text-primary-fg" : "mr-6 bg-surface border border-border",
            )}
          >
            {t.content}
          </div>
        ))}
      </div>
      {revealed && card ? (
        <div className="rounded-xl border border-border bg-paper-2 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Gabarito</p>
          <p className="mt-2 font-body text-base leading-normal">{card.gabarito}</p>
          <p className="mt-2 text-sm text-muted">
            {FONTE_LABEL[card.fonte]} · p. {card.paginas}
          </p>
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor="resp">Sua resposta</Label>
        <Textarea
          id="resp"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Escreva de memória, sem abrir a nota."
          disabled={!card || busy}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" onClick={() => void send()} disabled={busy || !answer.trim()}>
          {busy ? "Lendo…" : "Enviar"}
        </Button>
        <Button type="button" variant="secondary" onClick={nextQuestion} disabled={!revealed}>
          Próxima
        </Button>
      </div>
    </div>
  );
}

function CompararPanel({ aiOn }: { aiOn: boolean }) {
  const notes = useVault((s) => s.notes);
  const map = useVault((s) => s.map);
  const addReasoning = useVault((s) => s.addReasoning);
  const reasoning = useVault((s) => s.reasoning);
  const [tema, setTema] = useState("states");
  const [busy, setBusy] = useState(false);
  const current = reasoning.find((r) => r.tema === tema) ?? reasoning[0];

  async function run() {
    setBusy(true);
    const subset = notes.filter((n) => n.tema === tema);
    try {
      if (aiOn && subset.length) {
        const res = await compararFontes({ data: { tema, notes: subset } });
        if (res.ok) {
          addReasoning({
            id: `reason-${Date.now()}`,
            data: new Date().toISOString().slice(0, 10),
            pergunta: res.data.pergunta,
            tema,
            tabela: res.data.tabela,
            concordam: res.data.concordam,
            divergem: res.data.divergem,
            palavrasIguais: res.data.palavrasIguais,
            evidencia: res.data.evidencia,
            raciocinio: res.data.raciocinio,
          });
          toast.success("Comparação gravada em reasoning.");
          return;
        }
      }
      const entry = compareOffline({ notes, sources: [] }, tema);
      addReasoning(entry);
      toast.message(entry.divergem);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="tema">Tema do mapa</Label>
        <select
          id="tema"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-base"
        >
          {map.nodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.tema}
            </option>
          ))}
        </select>
      </div>
      <Button type="button" onClick={() => void run()} disabled={busy}>
        {busy ? "Cruzando…" : "Comparar fontes"}
      </Button>
      {current ? (
        <article className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-display text-lg">{current.pergunta}</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {current.tabela.map((row) => (
              <li key={row.fonte} className="border-t border-border pt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">{row.fonte}</p>
                <p className="mt-1 font-body text-base leading-normal">{row.afirma}</p>
                <p className="mt-1 text-sm text-muted">p. {row.pagina}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">{current.raciocinio}</p>
        </article>
      ) : null}
    </div>
  );
}
