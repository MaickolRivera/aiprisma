import { SectionHeading } from "@/components/SectionHeading";
import { MiniPlane } from "@/components/MiniPlane";
import { LAYERS } from "@/data/layers";
import { NEWS } from "@/data/news";
import CompositionGroup from "@/components/CompositionGroup";

const sample = NEWS[0];

export function Categories() {
  return (
    <section 
    id="categories" 
    className="border-b border-border">

      <div className="
      mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24 
      flex flex-col gap-10">
        <SectionHeading title="CATEGORÍAS">
          No todo se mide igual
        </SectionHeading>

        <div className="gap-10 flex flex-col">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Capas: ejes que se contrarrestan</h3>
            <p className="text-muted-foreground text-md">
              Cada capa es un plano con dos ejes y un extremo opuesto en cada uno. Laya da un valor entre -100% y +100% por eje, y la noticia queda como una flecha que sale del centro. Una flecha larga significa una inclinación fuerte. Una flecha corta, una noticia casi neutral en esa capa.
            </p>
          </div>

          <ul className="flex flex-col md:flex-row gap-5">
            {LAYERS.map((l) => {
              const v = sample.values[l.id];
              return (
                <li key={l.id} className="flex flex-col gap-4 rounded-xl border border-border bg-card py-6 px-7 w-full">
                  <div className="text-center">
                    <h4 className="flex flex-row items-center justify-center gap-2 font-semibold tracking-tight">
                      <span className="size-2 rounded-sm" style={{ background: l.color }} aria-hidden="true" />
                      {l.name}
                    </h4>
                    <p className="mt-1 text-xs leading-snug text-muted-foreground">{l.description}</p>
                  </div>

                  <div className="min-w-0 flex flex-row md:flex-col gap-5 md:gap-0 justify-center items-center">
                    <div className="size-24 shrink-0">
                      <MiniPlane x={v.x} y={v.y} color={l.color} />
                    </div>
                    
                    <p className="mt-2 text-[13px] leading-snug text-center">
                      {l.x[0]} ↔ {l.x[1]}
                      <br />
                      {l.y[0]} ↔ {l.y[1]}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="grid gap-10 lg:grid-cols-[2fr_3fr]">
          <div className="flex flex-col justify-center gap-2">
            <h3 className="text-xl font-semibold">Porcentajes que suman 100</h3>
            <p className="text-muted-foreground text-md">
              El tema y la intención no se oponen: se reparten. Una misma nota puede ser 55% economía, 30% política y 15% sociedad. Por eso no van como flechas sino como barras que siempre completan el total.
            </p>
          </div>

          <div className="grid gap-10 rounded-xl border border-border bg-card p-6 sm:grid-cols-2">
            <CompositionGroup title="Temas" items={sample.temas} />
            <CompositionGroup title="Intención" items={sample.alertas} />
          </div>
        </div>

      </div>
    </section>
  );
}