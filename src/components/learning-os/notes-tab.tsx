import type { ReactNode } from "react";
import { AnnotatedText } from "@/components/learning-os/annotated-text";
import { useVault } from "@/lib/vault/store";
import { FONTE_LABEL } from "@/lib/vault/types";
import { cn } from "@/lib/utils";

export function NotesTab() {
  const notes = useVault((s) => s.notes);
  const selectedNoteId = useVault((s) => s.selectedNoteId);
  const selectNote = useVault((s) => s.selectNote);
  const marks = useVault((s) => s.marks);
  const markCount = marks.filter((m) => m.noteId === selectedNoteId).length;
  const selected = notes.find((n) => n.id === selectedNoteId) ?? notes[0];

  if (!notes.length) {
    return <p className="text-muted">Nenhuma nota ainda. Destile um recorte na aba Estudar.</p>;
  }

  if (selected && selectedNoteId === selected.id) {
    return (
      <article className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => selectNote(null)}
          className="min-h-11 self-start text-sm font-medium text-primary"
        >
          Todas as notas
        </button>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {FONTE_LABEL[selected.fonte]} · {selected.capitulo} · p. {selected.paginas}
        </p>
        <h2 className="font-display text-2xl font-medium tracking-tight">{selected.title}</h2>
        <p className="text-sm text-muted">
          Selecione uma palavra ou frase em inglês para ver a tradução no local.
          {markCount ? ` ${markCount} marca${markCount > 1 ? "s" : ""} nesta nota.` : ""}
        </p>
        <Section title="Claim da fonte">
          <ul className="flex flex-col gap-2">
            {selected.claims.map((c, i) => (
              <AnnotatedText
                key={`${selected.id}-c-${i}`}
                as="li"
                className="font-body text-base leading-normal"
                text={c}
                noteId={selected.id}
                field={`claims-${i}`}
              />
            ))}
          </ul>
        </Section>
        {selected.quote ? (
          <Section title="Palavras do autor">
            <AnnotatedText
              as="blockquote"
              className="border-l-2 border-primary/40 pl-4 font-body text-base italic leading-normal text-fg"
              text={selected.quote.text}
              noteId={selected.id}
              field="quote"
            />
          </Section>
        ) : null}
        <Section title="Comentário nosso">
          <ul className="flex flex-col gap-2">
            {selected.comentario.map((c, i) => (
              <AnnotatedText
                key={`${selected.id}-n-${i}`}
                as="li"
                className="text-base leading-normal text-muted"
                text={c}
                noteId={selected.id}
                field={`comentario-${i}`}
              />
            ))}
          </ul>
        </Section>
        {selected.perguntasAbertas.length ? (
          <Section title="Perguntas em aberto">
            <ol className="flex list-decimal flex-col gap-2 pl-4">
              {selected.perguntasAbertas.map((q, i) => (
                <AnnotatedText
                  key={`${selected.id}-q-${i}`}
                  as="li"
                  className="text-base leading-normal"
                  text={q}
                  noteId={selected.id}
                  field={`pergunta-${i}`}
                />
              ))}
            </ol>
          </Section>
        ) : null}
        <p className="text-sm text-subtle">{selected.citacao}</p>
      </article>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {notes.map((n) => (
        <li key={n.id}>
          <button
            type="button"
            onClick={() => selectNote(n.id)}
            className={cn(
              "flex min-h-16 w-full flex-col items-start rounded-2xl border border-border bg-surface px-4 py-3 text-left",
            )}
          >
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              {FONTE_LABEL[n.fonte]} · p. {n.paginas}
            </span>
            <span className="mt-1 font-display text-lg leading-snug">{n.title}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted">{title}</h3>
      {children}
    </section>
  );
}
