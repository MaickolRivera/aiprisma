import { lazy, Suspense, useState } from "react";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { SectionHeading } from "@/components/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { NEWS } from "@/data/news";
import { cn } from "@/lib/utils";
import type { AnalysisResponse, LayerId } from "@/types";
import CompositionGroup from "@/components/CompositionGroup";
import { postAnalysis } from "@/lib/api";

const LayerScene = lazy(() => import("@/components/LayerScene").then((m) => ({ default: m.LayerScene })));

export function NewsExplorer() {
  const [newsId, setNewsId] = useState(NEWS[0].id);
  const [focus, setFocus] = useState<LayerId>("politica");

  const news = NEWS.find((n) => n.id === newsId)!;

  const [newTitle, setNewTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!newTitle.trim() || !body.trim()) {
        alert("Por favor ingresa tanto el titular como el contenido de la noticia.");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setAnalysis(await postAnalysis({ new: newTitle, body }));
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo analizar la noticia.");
      } finally {
        setLoading(false);
      }

  };


  return (
    <section id="news" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
        
        <SectionHeading title="NOTICIAS"></SectionHeading>

        <form onSubmit={handleSubmit} className="mt-12 flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Titular de la noticia"
              aria-label="Titular de la noticia"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-10 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-[15px] font-medium placeholder:font-normal placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-0"
            />
            <button type="submit" disabled={loading || !newTitle.trim() || !body.trim()} className={buttonVariants({ size: "lg" })}>
              {loading ? "Analizando…" : "Analizar"}
            </button>
          </div>
          {
            newTitle && (
              <textarea
                placeholder="Pega aquí el cuerpo de la noticia (mínimo 300 caracteres)"
                aria-label="Cuerpo de la noticia"
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-32 resize-y rounded-md border border-border bg-background px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-0"
              />
            )
          }
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        </form>

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
                  {
                    analysis && (
                      <LayerScene values={analysis.values} focus={focus} onFocus={setFocus} />
                    )
                  }
                </Suspense>
                <p className="pointer-events-none absolute bottom-3 left-4 text-xs text-muted-foreground text-balance">
                  | - Arrastra para girar | - Rueda para acercar | - Toca una flecha para enfocar su capa
                </p>
              </div>
              <AnalysisPanel news={news} focus={focus} onFocus={setFocus} />
            </div>

              {analysis && (
                <div className="grid gap-10 rounded-xl border border-border bg-card p-6 sm:grid-cols-2">
                  <CompositionGroup title="Temas" items={analysis.temas} />
                  <CompositionGroup title="Alertas" items={analysis.alertas} />
                </div> 
              )}

          </div>
        </div>
      </div>
    </section>
  );
}
