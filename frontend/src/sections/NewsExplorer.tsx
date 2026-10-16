import { lazy, Suspense, useState } from "react";
import { LayerConfidence, LayerTabs } from "@/components/AnalysisPanel";
import { SectionHeading } from "@/components/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { NEWS } from "@/data/news";
import { cn } from "@/lib/utils";
import type { LayerId, News } from "@/types";
import CompositionGroup from "@/components/CompositionGroup";
import { ModelLoader } from "@/components/ModelLoader";
import { NewsDescription } from "@/components/NewsDescription";
import { analyze, ANALYSIS_MODE } from "@/lib/analysis";
import { useLaya } from "@/lib/laya/useLaya";

const LayerScene = lazy(() => import("@/components/LayerScene").then((m) => ({ default: m.LayerScene })));

export function NewsExplorer() {
  const [newsId, setNewsId] = useState(NEWS[0].id);
  const [focus, setFocus] = useState<LayerId>("politica");

  const [userNews, setUserNews] = useState<News | null>(null);
  const newsList = userNews ? [userNews, ...NEWS] : NEWS;
  const news = newsList.find((n) => n.id === newsId)!;

  const [newTitle, setNewTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const browserMode = ANALYSIS_MODE === "browser";
  const laya = useLaya();

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!newTitle.trim() || !body.trim()) {
        alert("Por favor ingresa tanto el titular como el contenido de la noticia.");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await analyze({ new: newTitle, body });
        const id = `usuario-${Date.now()}`;
        setUserNews({ id, headline: newTitle.trim(), body: body.trim(), ...result });
        setNewsId(id);
        setNewTitle("");
        setBody("");

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

        {browserMode && (
          <div className="mt-12">
            <ModelLoader status={laya.status} error={laya.error} cached={laya.cached} elapsed={laya.elapsed} onLoad={laya.load} />
          </div>
        )}

        <form onSubmit={handleSubmit} className={cn("flex flex-col gap-3", browserMode ? "mt-4" : "mt-12")}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Titular de la noticia"
              aria-label="Titular de la noticia"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-10 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-[15px] font-medium placeholder:font-normal placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-0"
            />
            <button
              type="submit"
              disabled={loading || !newTitle.trim() || !body.trim() || (browserMode && laya.status !== "ready")}
              className={buttonVariants({ size: "lg" })}
            >
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
          <ul className="grid content-start gap-1" aria-label="Noticias">
            {newsList.map((n) => (
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
                  <span className="block text-[15px] font-medium leading-snug">{n.headline}</span>
                  <span className="mt-1 line-clamp-1 text-[13px] text-muted-foreground">{n.body}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="min-w-0 flex flex-col gap-10">
            <div>
              <h3 className="text-xl font-semibold leading-snug tracking-tight">{news.headline}</h3>
              <NewsDescription key={news.id} text={news.body} />
            </div>

            <div className="grid gap-5 md:grid-cols-[400px_minmax(0,1fr)]">
              <div className="flex min-w-0 flex-col gap-5">
                <LayerTabs focus={focus} onFocus={setFocus} />
                <div className="relative h-100 min-w-0 overflow-hidden rounded-xl border border-border bg-card">
                  <Suspense fallback={<p className="grid size-full place-items-center text-sm text-muted-foreground">Cargando escena…</p>}>
                    <LayerScene values={news.values} focus={focus} onFocus={setFocus} />
                  </Suspense>
                  <p className="pointer-events-none absolute bottom-3 left-4 text-xs text-muted-foreground text-balance">
                    | - Arrastra para girar | - Rueda para acercar | - Toca una flecha para enfocar su capa
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex gap-8 rounded-xl border border-border bg-card p-6 flex-col">
                  <LayerConfidence values={news.values} focus={focus} />
                  <CompositionGroup title="Temas" items={news.temas} />
                  <CompositionGroup title="Alertas" items={news.alertas} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
