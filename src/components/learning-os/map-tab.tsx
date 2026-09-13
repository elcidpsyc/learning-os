import { useVault } from "@/lib/vault/store";

export function MapTab() {
  const map = useVault((s) => s.map);
  const notes = useVault((s) => s.notes);
  const selectNote = useVault((s) => s.selectNote);
  const setTab = useVault((s) => s.setTab);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted">Nós de tema. Lista, não grafo.</p>
      <ul className="flex flex-col gap-2">
        {map.nodes.map((node) => (
          <li key={node.id} className="rounded-2xl border border-border bg-surface px-4 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-lg leading-snug">{node.tema}</h2>
              <span className="text-xs uppercase tracking-wide text-muted">{node.status}</span>
            </div>
            {node.noteIds.length ? (
              <ul className="mt-3 flex flex-col gap-1">
                {node.noteIds.map((id) => {
                  const n = notes.find((x) => x.id === id);
                  if (!n) return null;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        className="min-h-11 w-full text-left text-sm text-primary"
                        onClick={() => {
                          selectNote(id);
                          setTab("notas");
                        }}
                      >
                        {n.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-subtle">Ainda sem nota.</p>
            )}
          </li>
        ))}
      </ul>
      {map.edges.length ? (
        <section>
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Ligações</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {map.edges.map((e) => (
              <li key={`${e.from}-${e.relation}-${e.to}`} className="text-sm leading-normal">
                <span className="font-medium">{label(map.nodes, e.from)}</span>
                <span className="text-muted"> {e.relation} </span>
                <span className="font-medium">{label(map.nodes, e.to)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section>
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Contradições</h3>
        <p className="mt-2 text-sm text-muted">
          {map.contradictions.length
            ? map.contradictions.join(" ")
            : "Vazio até o comparador rodar com duas fontes destiladas."}
        </p>
      </section>
    </div>
  );
}

function label(nodes: { id: string; tema: string }[], id: string) {
  return nodes.find((n) => n.id === id)?.tema ?? id;
}
