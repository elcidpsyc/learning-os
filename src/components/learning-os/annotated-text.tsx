import { Fragment, useMemo, type ReactNode } from "react";
import { openGlossPopup } from "@/lib/study/gloss-events";
import { useVault } from "@/lib/vault/store";
import type { GlossMark } from "@/lib/vault/types";
import { cn } from "@/lib/utils";

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitByMarks(text: string, marks: GlossMark[]): { text: string; mark: GlossMark | null }[] {
  if (!marks.length) return [{ text, mark: null }];
  const sorted = [...marks].sort((a, b) => b.text.length - a.text.length);
  const pattern = new RegExp(`(${sorted.map((m) => escapeRe(m.text)).join("|")})`, "gi");
  const parts = text.split(pattern);
  return parts.filter(Boolean).map((part) => {
    const mark = sorted.find((m) => m.text.toLowerCase() === part.toLowerCase()) ?? null;
    return { text: part, mark };
  });
}

export function AnnotatedText({
  text,
  noteId,
  field,
  className,
  as: Tag = "span",
}: {
  text: string;
  noteId: string | null;
  field: string;
  className?: string;
  as?: "span" | "p" | "blockquote" | "li";
}) {
  const allMarks = useVault((s) => s.marks);
  const marks = useMemo(
    () =>
      allMarks.filter((m) => {
        if (m.field !== field) return false;
        if (noteId && m.noteId && m.noteId !== noteId) return false;
        return text.toLowerCase().includes(m.text.toLowerCase());
      }),
    [allMarks, field, noteId, text],
  );
  const chunks = splitByMarks(text, marks);

  function onMark(mark: GlossMark, el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    openGlossPopup({
      text: mark.text,
      rect,
      noteId,
      field,
      existing: mark,
      preset: {
        translation: mark.translation,
        literal: mark.literal,
        variations: mark.variations,
        source: "local",
      },
    });
  }

  const inner: ReactNode = chunks.map((chunk, i) =>
    chunk.mark ? (
      <mark
        key={`${chunk.mark.id}-${i}`}
        className="gloss-mark"
        data-gloss-mark={chunk.mark.id}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onMark(chunk.mark!, e.currentTarget);
        }}
      >
        {chunk.text}
      </mark>
    ) : (
      <Fragment key={`t-${i}`}>{chunk.text}</Fragment>
    ),
  );

  return (
    <Tag
      className={cn(className)}
      data-gloss-note={noteId ?? ""}
      data-gloss-field={field}
    >
      {inner}
    </Tag>
  );
}
