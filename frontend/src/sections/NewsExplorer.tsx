import { lazy, Suspense, useState } from "react";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { SectionHeading } from "@/components/SectionHeading";
import { NEWS } from "@/data/news";
import { cn } from "@/lib/utils";
import type { LayerId } from "@/types";
import CompositionGroup from "@/components/CompositionGroup";

const LayerScene = lazy(() => import("@/components/LayerScene").then((m) => ({ default: m.LayerScene })));

export function NewsExplorer() {
  const [newsId, setNewsId] = useState(NEWS[0].id);
  const [focus, setFocus] = useState<LayerId>("politica");

  const news = NEWS.find((n) => n.id === newsId)!;

  return (
    <section id="news" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
        
        <SectionHeading title="NOTICIAS"></SectionHeading>

        <div className="mt-12 grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          <ul className="grid content-start gap-1" aria-label="Noticias de ejemplo">
            {NEWS.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  aria-pressed={n.id === newsId}
                  onClick={() => setNewsId(n.id)}
                  className={cn(
                    "w-full cursor-pointer rounded-lg border p-3.5 text-left transition-colors",
                    n.id === newsId ? "border-foreground bg-accent" : "border-transparent hover:bg-accent",
                  )}
                >
                  <span className="block text-[13px] text-muted-foreground">{n.outlet}</span>
                  <span className="mt-1 block text-[15px] font-medium leading-snug">{n.headline}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="min-w-0 flex flex-col gap-10">
            <div>
              <h3 className="text-xl font-semibold leading-snug tracking-tight">{news.headline}</h3>
              <p className="text-sm text-primary/50">{news.summary}</p>
            </div>

            <div className="grid gap-5 md:grid-cols-[400px_minmax(0,1fr)]">
              <div className="relative h-110 min-w-0 overflow-hidden rounded-xl border border-border bg-card">
                <Suspense fallback={<p className="grid size-full place-items-center text-sm text-muted-foreground">Cargando escena…</p>}>
                  <LayerScene values={news.values} focus={focus} onFocus={setFocus} />
                </Suspense>
                <p className="pointer-events-none absolute bottom-3 left-4 text-xs text-muted-foreground text-balance">
                  | - Arrastra para girar | - Rueda para acercar | - Toca una flecha para enfocar su capa
                </p>
              </div>
              <AnalysisPanel news={news} focus={focus} onFocus={setFocus} />
            </div>

            <div className="grid gap-10 rounded-xl border border-border bg-card p-6 sm:grid-cols-2">
              <CompositionGroup title="Temas" items={news.temas} />
              <CompositionGroup title="Alertas" items={news.alertas} />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
