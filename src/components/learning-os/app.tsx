import { useEffect, useState } from "react";
import { BookOpen, Library, RotateCcw, StickyNote, Waypoints } from "lucide-react";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { hydrateVault, useVault, type TabId } from "@/lib/vault/store";
import { getAiStatus } from "@/lib/study/ai";
import { StudyTab } from "./study-tab";
import { NotesTab } from "./notes-tab";
import { ReviewTab } from "./review-tab";
import { MapTab } from "./map-tab";
import { SourcesTab } from "./sources-tab";

const TABS: { id: TabId; label: string; icon: typeof BookOpen }[] = [
  { id: "estudar", label: "Estudar", icon: BookOpen },
  { id: "notas", label: "Notas", icon: StickyNote },
  { id: "revisar", label: "Revisar", icon: RotateCcw },
  { id: "mapa", label: "Mapa", icon: Waypoints },
  { id: "fontes", label: "Fontes", icon: Library },
];

export function LearningOS() {
  const tab = useVault((s) => s.tab);
  const setTab = useVault((s) => s.setTab);
  const cards = useVault((s) => s.cards);
  const [aiOn, setAiOn] = useState(false);

  useEffect(() => {
    useVault.setState({ hydrated: true });
    hydrateVault();
    void getAiStatus()
      .then((r) => setAiOn(Boolean(r?.available)))
      .catch(() => setAiOn(false));
  }, []);

  const due = cards.filter((c) => c.proxima <= new Date().toISOString().slice(0, 10) && c.qualidade < 3).length;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-bg text-fg">
      <header className="sticky top-0 z-10 border-b border-border bg-bg/95 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-sm">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">Learning OS</p>
        <h1 className="mt-1 font-display text-2xl font-medium tracking-tight text-fg">Entender e lembrar</h1>
        <p className="mt-1 text-sm text-muted">Psicologia · Iyer, Kidd, Vidal</p>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-28">
        {due > 0 && tab !== "revisar" ? (
          <button
            type="button"
            onClick={() => setTab("revisar")}
            className="mb-4 flex min-h-11 w-full items-center justify-between rounded-xl border border-border bg-surface px-4 text-left text-sm text-fg"
          >
            <span>
              Revisar {due} card{due > 1 ? "s" : ""} da fila
            </span>
            <span className="text-muted">Abrir</span>
          </button>
        ) : null}
        {tab === "estudar" ? <StudyTab aiOn={aiOn} /> : null}
        {tab === "notas" ? <NotesTab /> : null}
        {tab === "revisar" ? <ReviewTab /> : null}
        {tab === "mapa" ? <MapTab /> : null}
        {tab === "fontes" ? <SourcesTab aiOn={aiOn} /> : null}
      </main>

      <nav
        className="fixed bottom-0 left-1/2 z-20 w-full max-w-lg -translate-x-1/2 border-t border-border bg-surface/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-sm"
        aria-label="Abas"
      >
        <ul className="grid grid-cols-5">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "flex min-h-12 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                    active ? "text-primary" : "text-muted",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <Toaster position="top-center" richColors />
    </div>
  );
}
