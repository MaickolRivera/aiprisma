import { LAYERS } from "@/data/layers";
import { cn } from "@/lib/utils";
import type { LayerId, LayerReading } from "@/types";

interface Props {
  values: Record<LayerId, LayerReading>;
  focus: LayerId;
  onFocus: (id: LayerId) => void;
}

export function AnalysisPanel({ values, focus, onFocus }: Props) {
  const layer = LAYERS.find((l) => l.id === focus)!;
  const confidence = Math.round(values[layer.id].c * 100);

  return (
    <div className="min-w-0">
      <div className="h-full rounded-xl border border-border bg-card px-3 py-5 flex flex-col gap-4 items-center">
        
        <h4 className="text-[15px] font-medium leading-snug">ESTADISTICAS</h4>
        
        <div role="tablist" aria-label="Capa a detallar" className="flex flex-wrap gap-1.5">
          {LAYERS.map((l) => (
            <button
              key={l.id}
              role="tab"
              type="button"
              aria-selected={l.id === focus}
              onClick={() => onFocus(l.id)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
                l.id === focus ? "border-foreground bg-accent" : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <span className="size-2 rounded-sm" style={{ background: l.color }} aria-hidden="true" />
              {l.name}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 w-full px-2">
          <p className="block text-[13px] text-muted-foreground">Confianza de Laya, {`${confidence}%`}</p>
          <div className="h-1.5 overflow-hidden rounded-full bg-border" aria-hidden="true">
            <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${confidence}%`, background: layer.color }} />
          </div>
        </div>
      </div>
    </div>
  );
}
