import { LAYERS } from "@/data/layers";
import { cn } from "@/lib/utils";
import type { LayerId, News } from "@/types";

function pctAxis(v: number, labels: [string, string]) {
  const p = Math.round(Math.abs(v) * 100);
  return p < 5 ? "neutral" : `${p}% hacia ${labels[v < 0 ? 0 : 1]}`;
}

interface Props {
  news: News;
  focus: LayerId;
  onFocus: (id: LayerId) => void;
}

export function AnalysisPanel({ news, focus, onFocus }: Props) {
  const layer = LAYERS.find((l) => l.id === focus)!;
  const d = news.values[layer.id];
  const intensity = Math.round(Math.min(1, Math.hypot(d.x, d.y) / Math.SQRT2) * 100);
  const confidence = Math.round(d.c * 100);

  return (
    <div className="min-w-0">
      <div className="h-full rounded-xl border border-border bg-card p-5">
        <div role="tablist" aria-label="Capa a detallar" className="flex flex-wrap gap-1.5">
          {LAYERS.map((l) => (
            <button
              key={l.id}
              role="tab"
              type="button"
              aria-selected={l.id === focus}
              onClick={() => onFocus(l.id)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                l.id === focus ? "border-foreground bg-accent" : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <span className="size-2.5 rounded-sm" style={{ background: l.color }} aria-hidden="true" />
              {l.name}
            </button>
          ))}
        </div>

        <dl className="mt-5 grid gap-2.5 text-sm">
          {[
            [`${layer.x[0]} ↔ ${layer.x[1]}`, pctAxis(d.x, layer.x)],
            [`${layer.y[0]} ↔ ${layer.y[1]}`, pctAxis(d.y, layer.y)],
            ["Intensidad de la flecha", `${intensity}%`],
            ["Confianza de Laya", `${confidence}%`],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border" aria-hidden="true">
          <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${confidence}%`, background: layer.color }} />
        </div>
      </div>
    </div>
  );
}
