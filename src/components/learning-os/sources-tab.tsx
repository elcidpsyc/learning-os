import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useVault } from "@/lib/vault/store";
import type { VaultData } from "@/lib/vault/types";

export function SourcesTab({ aiOn }: { aiOn: boolean }) {
  const sources = useVault((s) => s.sources);
  const profile = useVault((s) => s.profile);
  const exportVault = useVault((s) => s.exportVault);
  const replaceVault = useVault((s) => s.replaceVault);
  const restoreSeed = useVault((s) => s.restoreSeed);
  const fileRef = useRef<HTMLInputElement>(null);

  function onExport() {
    const data = exportVault();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `learning-os-vault-${data.generatedAt}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Vault exportado. Guarde o JSON noutro aparelho se quiser.");
  }

  function onImport(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as VaultData;
        if (!parsed.notes || !parsed.cards) throw new Error("JSON sem notes/cards");
        replaceVault(parsed);
        toast.success("Vault importado neste aparelho.");
      } catch {
        toast.error("JSON inválido.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
        {aiOn
          ? "Modelo ligado neste ambiente: destilar e o socrático podem usar a API."
          : "Sem modelo no ar. As notas do Preface já estão no aparelho. Destilar vira template; o socrático usa a fila."}
      </p>
      {sources.map((src) => (
        <article key={src.id} className="rounded-2xl border border-border bg-surface px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {src.ano} · {src.local}
          </p>
          <h2 className="mt-1 font-display text-xl leading-snug">{src.obra}</h2>
          <p className="mt-1 text-sm text-muted">{src.autor}</p>
          <p className="mt-3 text-sm leading-normal text-fg">{src.mapeamento}</p>
          <ul className="mt-3 flex flex-col gap-1">
            {src.capitulos.map((ch) => (
              <li key={ch.titulo} className="flex min-h-11 items-center justify-between gap-3 text-sm">
                <span>
                  {ch.titulo}
                  {ch.pagina != null ? <span className="text-muted"> · p. {ch.pagina}</span> : null}
                </span>
                <span className="text-xs uppercase tracking-wide text-muted">{ch.status}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Perfil</h3>
        <p className="text-sm leading-normal">{profile.intencao}</p>
        <p className="text-sm text-muted">{profile.nivel}</p>
        <p className="text-sm">Já entendeu: {profile.jaEntendeu.join(" ") || "—"}</p>
      </section>
      <div className="flex flex-col gap-2">
        <Button type="button" onClick={onExport}>
          Exportar JSON
        </Button>
        <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
          Importar JSON
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            restoreSeed();
            toast.success("Notas-semente do Preface restauradas.");
          }}
        >
          Restaurar Preface
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImport(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
