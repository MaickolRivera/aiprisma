import { LAYERS } from "@/data/layers";
import { cn } from "@/lib/utils";
import type { LayerId, LayerReading } from "@/types";

const card = "rounded-xl border border-border bg-card";

export function LayerTabs({ focus, onFocus }: { focus: LayerId; onFocus: (id: LayerId) => void }) {
  return (
    <div role="tablist" aria-label="Capa a detallar" className={cn(card, "flex flex-wrap justify-center gap-4 p-3")}>
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
  );
}

export function LayerConfidence({ values, focus }: { values: Record<LayerId, LayerReading>; focus: LayerId }) {
  const layer = LAYERS.find((l) => l.id === focus)!;
  const confidence = Math.round(values[layer.id].c * 100);

  return (
    <div className={cn(card, "flex flex-col gap-2 border-0")}>
      <p className="text-[13px] text-muted-foreground">Confianza de Laya, {`${confidence}%`}</p>
      <div className="h-1.5 overflow-hidden rounded-full bg-border" aria-hidden="true">
        <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${confidence}%`, background: layer.color }} />
      </div>
    </div>
  );
}
