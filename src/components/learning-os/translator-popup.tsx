import { useCallback, useEffect, useRef, useState } from "react";
import { onGlossOpen, type GlossOpenDetail } from "@/lib/study/gloss-events";
import { translateSelection, type GlossResult } from "@/lib/study/translate";
import { useVault } from "@/lib/vault/store";
import { Button } from "@/components/ui/button";

type Popup = {
  text: string;
  noteId: string | null;
  field: string;
  left: number;
  top: number;
  width: number;
  result: GlossResult | null;
  loading: boolean;
  existingId: string | null;
};

function place(rect: { top: number; left: number; width: number; height: number }): {
  left: number;
  top: number;
  width: number;
} {
  const width = Math.min(320, Math.max(248, window.innerWidth - 24));
  let left = rect.left + rect.width / 2 - width / 2;
  left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
  const header = 76;
  const nav = 84;
  const estimated = 250;
  const below = rect.top + Math.max(rect.height, 8) + 10;
  const fitsBelow = below + Math.min(estimated, 200) <= window.innerHeight - nav;
  let top = fitsBelow ? below : rect.top - 10 - 180;
  top = Math.max(header, Math.min(top, window.innerHeight - nav - 120));
  return { left, top, width };
}

function readContext(node: Node | null): { noteId: string | null; field: string; context: string } {
  const el = node instanceof Element ? node : node?.parentElement;
  const host = el?.closest("[data-gloss-field]") as HTMLElement | null;
  return {
    noteId: host?.dataset.glossNote || null,
    field: host?.dataset.glossField || "texto",
    context: (host?.textContent ?? "").slice(0, 400),
  };
}

function selectedText(): { text: string; rect: DOMRect; anchor: Node } | null {
  const active = document.activeElement;
  if (active && (active.tagName === "TEXTAREA" || active.tagName === "INPUT")) return null;
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;
  const text = sel.toString().replace(/\s+/g, " ").trim();
  if (text.length < 2 || text.length > 280) return null;
  const range = sel.getRangeAt(0);
  const anchor = sel.anchorNode;
  if (!anchor) return null;
  const host = anchor instanceof Element ? anchor : anchor.parentElement;
  if (host?.closest("[data-gloss-popup]")) return null;
  if (host?.closest("button, textarea, input")) return null;
  const first = range.getClientRects()[0] as DOMRect | undefined;
  const rough = first ?? range.getBoundingClientRect();
  if (rough.top < 80 || rough.bottom > window.innerHeight - 96) {
    const node = range.startContainer instanceof Element ? range.startContainer : range.startContainer.parentElement;
    node?.scrollIntoView({ block: "center", inline: "nearest" });
  }
  const rect = (range.getClientRects()[0] as DOMRect | undefined) ?? range.getBoundingClientRect();
  if (!rect.width && !rect.height) return null;
  return { text, rect, anchor };
}

export function TranslatorPopup() {
  const addMark = useVault((s) => s.addMark);
  const removeMark = useVault((s) => s.removeMark);
  const marks = useVault((s) => s.marks);
  const selectedNoteId = useVault((s) => s.selectedNoteId);
  const [popup, setPopup] = useState<Popup | null>(null);
  const seq = useRef(0);

  const openFrom = useCallback(
    (detail: GlossOpenDetail) => {
      const pos = place(detail.rect);
      const id = ++seq.current;
      const existing =
        detail.existing ??
        marks.find(
          (m) =>
            m.text.toLowerCase() === detail.text.toLowerCase() &&
            (m.field === detail.field || !detail.field) &&
            (!detail.noteId || !m.noteId || m.noteId === detail.noteId),
        );
      setPopup({
        text: detail.text,
        noteId: detail.noteId,
        field: detail.field,
        left: pos.left,
        top: pos.top,
        width: pos.width,
        result: detail.preset ?? null,
        loading: !detail.preset && !existing,
        existingId: existing?.id ?? null,
      });
      if (detail.preset || existing) {
        if (existing && !detail.preset) {
          setPopup((p) =>
            p
              ? {
                  ...p,
                  loading: false,
                  existingId: existing.id,
                  result: {
                    translation: existing.translation,
                    literal: existing.literal,
                    variations: existing.variations,
                    source: "local",
                  },
                }
              : p,
          );
        }
        return;
      }
      void translateSelection({ text: detail.text, context: detail.context }).then((result) => {
        if (seq.current !== id) return;
        setPopup((p) => (p ? { ...p, result, loading: false } : p));
      });
    },
    [marks],
  );

  useEffect(() => onGlossOpen(openFrom), [openFrom]);

  useEffect(() => {
    let timer: number | undefined;
    const consider = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const found = selectedText();
        if (!found) return;
        const ctx = readContext(found.anchor);
        openFrom({
          text: found.text,
          rect: found.rect,
          noteId: ctx.noteId || selectedNoteId,
          field: ctx.field,
          context: ctx.context,
        });
      }, 280);
    };
    document.addEventListener("selectionchange", consider);
    document.addEventListener("pointerup", consider);
    return () => {
      document.removeEventListener("selectionchange", consider);
      document.removeEventListener("pointerup", consider);
      window.clearTimeout(timer);
    };
  }, [openFrom, selectedNoteId]);

  useEffect(() => {
    if (!popup) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPopup(null);
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("[data-gloss-popup]")) return;
      if (t?.closest(".gloss-mark")) return;
      window.getSelection()?.removeAllRanges();
      setPopup(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [popup]);

  if (!popup) return null;

  function markHere() {
    if (!popup?.result) return;
    addMark({
      text: popup.text,
      translation: popup.result.translation,
      literal: popup.result.literal,
      variations: popup.result.variations,
      noteId: popup.noteId,
      field: popup.field,
    });
    const saved = useVault
      .getState()
      .marks.find(
        (m) =>
          m.text.toLowerCase() === popup.text.toLowerCase() &&
          m.field === popup.field &&
          (m.noteId ?? null) === (popup.noteId ?? null),
      );
    setPopup({ ...popup, existingId: saved?.id ?? popup.existingId });
  }

  return (
    <div
      data-gloss-popup="1"
      role="dialog"
      aria-label="Tradução"
      className="fixed z-40 max-h-[min(70dvh,28rem)] overflow-y-auto rounded-xl bg-surface px-3 py-3 text-fg shadow-border"
      style={{ left: popup.left, top: popup.top, width: popup.width }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <p className="font-body text-sm italic leading-normal text-muted">{popup.text}</p>
      {popup.loading ? (
        <p className="mt-2 text-sm text-muted">Traduzindo…</p>
      ) : popup.result ? (
        <div className="mt-2 flex flex-col gap-2">
          <p className="font-display text-xl font-medium leading-snug">{popup.result.translation}</p>
          {popup.result.literal && popup.result.literal !== popup.result.translation ? (
            <p className="text-sm text-muted">Literal: {popup.result.literal}</p>
          ) : null}
          {popup.result.variations.length ? (
            <ul className="flex flex-col gap-2 border-t border-border pt-2">
              {popup.result.variations.map((v) => (
                <li key={v.pt} className="text-sm leading-normal">
                  <span className="font-medium">{v.pt}</span>
                  {v.nota ? <span className="text-muted"> — {v.nota}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {popup.existingId ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (popup.existingId) removeMark(popup.existingId);
              setPopup({ ...popup, existingId: null });
            }}
          >
            Desmarcar
          </Button>
        ) : (
          <Button type="button" data-gloss-action="pin" onClick={markHere} disabled={!popup.result || popup.loading}>
            Marcar aqui
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={() => {
          window.getSelection()?.removeAllRanges();
          setPopup(null);
        }}>
          Fechar
        </Button>
      </div>
    </div>
  );
}
