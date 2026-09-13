import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { nextDueCard } from "@/lib/study/offline";
import { useVault } from "@/lib/vault/store";
import { FONTE_LABEL } from "@/lib/vault/types";

export function ReviewTab() {
  const cards = useVault((s) => s.cards);
  const activeCardId = useVault((s) => s.activeCardId);
  const setActiveCard = useVault((s) => s.setActiveCard);
  const recordAttempt = useVault((s) => s.recordAttempt);
  const card = useMemo(
    () => cards.find((c) => c.id === activeCardId) ?? nextDueCard(cards),
    [cards, activeCardId],
  );
  const [draft, setDraft] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!card) {
    return <p className="text-muted">A fila está vazia. Destile um recorte para gerar cards.</p>;
  }

  function submit() {
    if (!card || !draft.trim()) return;
    setSubmitted(true);
  }

  function grade(q: 1 | 2 | 3 | 4) {
    if (!card) return;
    recordAttempt(card.id, draft.trim(), q);
    const nxt = nextDueCard(useVault.getState().cards, card.id);
    setActiveCard(nxt?.id ?? null);
    setDraft("");
    setSubmitted(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {FONTE_LABEL[card.fonte]} · p. {card.paginas}
      </p>
      <h2 className="font-display text-2xl font-medium leading-snug tracking-tight">{card.q}</h2>
      <div className="flex flex-col gap-2">
        <Label htmlFor="tentativa">Sua tentativa</Label>
        <Textarea
          id="tentativa"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escreva de memória. O gabarito fica escondido."
          disabled={submitted}
        />
      </div>
      {!submitted ? (
        <Button type="button" onClick={submit} disabled={!draft.trim()}>
          Enviar
        </Button>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-surface px-4 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Gabarito</p>
            <p className="mt-2 font-body text-base leading-normal">{card.gabarito}</p>
          </div>
          <p className="text-sm text-muted">Qualidade desta resposta</p>
          <div className="grid grid-cols-4 gap-2">
            {(
              [
                [1, "Em branco"],
                [2, "Parcial"],
                [3, "Certo"],
                [4, "Ligou"],
              ] as const
            ).map(([n, label]) => (
              <button
                key={n}
                type="button"
                onClick={() => grade(n)}
                className="flex min-h-14 flex-col items-center justify-center rounded-xl border border-border bg-surface text-sm font-medium"
              >
                <span className="tabular-nums text-base">{n}</span>
                <span className="text-[11px] text-muted">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
