import { useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, Forward } from "lucide-react";
import { EyeFollower, type Gaze } from "@/components/EyeFollower";
import { MiniPlane } from "@/components/MiniPlane";
import { buttonVariants } from "@/components/ui/button";
import { LAYERS } from "@/data/layers";
import { CAPTIONS, MENU_ANCHORS, STORY_NEWS as sample, TIMELINE as T } from "@/data/story";
import { clamp, ease, lerp, seg } from "@/lib/scroll";
import { cn } from "@/lib/utils";

const LAYER_STEP = (T.not - T.categories) / LAYERS.length; // cuánto dura el foco en cada capa
const GAP = 20; // separación entre título, tarjeta y ojo
const CTA_GAP = 44; // separación entre la tarjeta y el botón

// Medidas que solo cambian al redimensionar: se guardan para no leer el layout en cada frame
interface Metrics {
  vw: number;
  vh: number;
  trackTop: number;
  trackH: number;
  W: number; // lado de la pila
  Ew: number;
  He: number; // ojo
  Tw: number;
  Ht: number; // bloque del título
  Hc: number; // tarjeta
  Wb: number;
  Hb: number; // botón
  slot: { x: number; y: number; w: number; h: number }; // hueco del ojo junto a PRISMA
  lh: number; // alto de línea del titular
}

interface Hero {
  top0: number;
  cy0: number;
  titleX: number;
}

interface Stack {
  sc: number;
  cx: number;
  cy: number;
  rx: number;
  ex: number;
  move: number;
  read: number;
  zTop: number;
}

export function ScrollStory() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const eyeRef = useRef<HTMLDivElement>(null);
  const eyeSlotRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const planeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gaze = useRef<Gaze>(null);

  const [step, setStep] = useState(-1);
  const [focus, setFocus] = useState(-1);

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const track = trackRef.current!, stage = stageRef.current!, stack = stackRef.current!;
    const title = titleRef.current!, eye = eyeRef.current!, card = cardRef.current!;
    const head = headRef.current!, scan = scanRef.current!, hint = hintRef.current!;
    const cta = ctaRef.current!, slot = eyeSlotRef.current!;

    let m: Metrics;
    let lastP = -1;
    let raf = 0;

    const measure = () => {
      m = {
        vw: stage.clientWidth,
        vh: stage.clientHeight,
        trackTop: track.getBoundingClientRect().top + window.scrollY,
        trackH: track.offsetHeight,
        W: stack.offsetWidth,
        Ew: eye.offsetWidth,
        He: eye.offsetHeight,
        Tw: title.offsetWidth,
        Ht: title.offsetHeight,
        Hc: card.offsetHeight,
        Wb: cta.offsetWidth,
        Hb: cta.offsetHeight,
        slot: { x: slot.offsetLeft, y: slot.offsetTop, w: slot.offsetWidth, h: slot.offsetHeight },
        lh: parseFloat(getComputedStyle(head).lineHeight) || 26,
      };
      lastP = -1; // con medidas nuevas hay que redibujar aunque el scroll no cambie
    };

    // Título, botón y pista: se desvanecen al empezar a bajar
    const placeHero = (p: number): Hero => {
      const { vw, vh, Tw, Ht, Hc, Wb, Hb } = m;
      const out = ease(seg(p, ...T.heroOut));
      const lift = 40 * out;
      const top0 = Math.max(72, (vh - (Ht + 2 * GAP + Hc + CTA_GAP + Hb)) / 2);
      const cy0 = top0 + Ht + 2 * GAP + Hc / 2;
      const titleX = vw / 2 - Tw / 2;

      title.style.transform = `translate(${titleX}px, ${top0 - lift}px)`;
      cta.style.transform = `translate(${vw / 2 - Wb / 2}px, ${cy0 + Hc / 2 + CTA_GAP - lift}px)`;
      for (const el of [title, cta]) {
        el.style.opacity = String(1 - out);
        el.style.visibility = out >= 1 ? "hidden" : "visible";
      }
      hint.style.opacity = String(1 - seg(p, ...T.hint));
      hint.style.visibility = p >= T.hint[1] ? "hidden" : "visible";

      return { top0, cy0, titleX };
    };

    // Pila de capas y tarjeta del titular
    const placeStack = (p: number, { cy0 }: Hero): Stack => {
      const { vw, vh, W } = m;
      const lg = vw >= 1024, sm = vw >= 640;
      const side = ease(seg(p, ...T.captionsIn));
      const move = ease(seg(p, T.read[0], T.explode[1]));
      const ex = ease(seg(p, ...T.explode));
      const drift = reduce ? 0 : seg(p, T.explode[1], T.not);
      const settle = seg(p, T.not, T.not + T.settle);

      const sc = lerp(1, lg ? 0.88 : sm ? 0.76 : 0.6, move);
      const rx = 58 * ex;
      const rz = (45 + (reduce ? 0 : 25 * seg(p, T.explode[1], 1))) * ex;

      // Cada plano se separa con su propio ritmo: ese desfase es el parallax
      const gap = W * 0.22;
      const zOf = (k: number) => {
        const e = ease(seg(p, T.explode[0] + k * T.planeDelay, T.explode[1] + k * T.planeEndDelay));
        return (2 - k) * gap * e * (1 + 0.4 * drift * (1 + k * 0.15)) * (1 - 0.3 * settle);
      };
      const zTop = zOf(0);

      // Al inicio la tarjeta va debajo del título; luego se corre para dejar sitio a los subtítulos
      const cx = vw / 2 + (lg ? Math.min(vw * 0.18, 240) : -Math.min(28, vw * 0.07)) * side;
      const cy = lerp(cy0, lg ? vh * 0.55 : vh * 0.4, move);

      stack.style.transform = `translate(${cx - W / 2}px, ${cy - W / 2}px) perspective(1400px) scale(${sc}) rotateX(${rx}deg) rotateZ(${rz}deg)`;
      stack.style.setProperty("--rx", `${rx}deg`);
      stack.style.setProperty("--rz", `${rz}deg`);
      stack.style.setProperty("--isc", String(1 / sc));

      // Tarjeta del titular: lectura y luego queda como rastro arriba de la pila
      const read = seg(p, ...T.scan);
      card.style.transform = `translateZ(${zTop}px) translateY(-50%)`;
      card.style.opacity = String(1 - 0.85 * ease(seg(p, ...T.cardOut)));
      scan.style.height = `${read * 100}%`;
      scan.style.opacity = String(read > 0 ? 1 - seg(p, ...T.scanOut) : 0);

      const labelsIn = String(seg(ex, 0.6, 1));
      LAYERS.forEach((_, i) => {
        const k = i + 1;
        const start = T.explode[0] + k * T.planeDelay;
        layerRefs.current[i]!.style.transform = `translateZ(${zOf(k)}px)`;
        planeRefs.current[i]!.style.opacity = String(seg(p, start, start + T.planeFade));
        labelRefs.current[i]!.style.opacity = labelsIn;
      });

      return { sc, cx, cy, rx, ex, move, read, zTop };
    };

    // El ojo sale de su hueco junto a PRISMA y se ubica encima de la tarjeta para leerla
    const placeEye = (p: number, hero: Hero, st: Stack) => {
      const { vw, W, Ew, He, Hc, slot: s } = m;
      const lg = vw >= 1024;
      const t = ease(seg(p, ...T.eyeIn));
      const above = st.sc * lerp(Hc / 2, W * (0.375 + (Math.sin((st.rx * Math.PI) / 180) * st.zTop) / W), st.ex);
      const readerScale = lerp(lg ? 0.85 : 0.6, lg ? 0.6 : 0.42, st.move);
      const es = lerp(s.w / Ew, readerScale, t);
      const x = lerp(hero.titleX + s.x + s.w / 2, st.cx, t);
      const y = lerp(hero.top0 + s.y + s.h / 2, st.cy - above - GAP - (He * readerScale) / 2, t);
      eye.style.transform = `translate(${x - Ew / 2}px, ${y - He / 2}px) scale(${es})`;
    };

    // A dónde mira el ojo: el puntero, luego el renglón que lee, luego la capa en foco
    const aimEye = (rect: DOMRect | null, reading: boolean, st: Stack) => {
      if (!rect) {
        gaze.current = null;
      } else if (reading) {
        const lines = Math.max(1, Math.round(rect.height / (m.lh * st.sc)));
        const t = st.read * lines;
        const line = Math.min(lines - 1, Math.floor(t));
        gaze.current = {
          x: rect.left + rect.width * (0.05 + 0.9 * (t - line)),
          y: rect.top + (rect.height * (line + 0.5)) / lines,
        };
      } else {
        gaze.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }
    };

    const update = () => {
      raf = 0;
      const p = clamp((window.scrollY - m.trackTop) / Math.max(1, m.trackH - m.vh));
      if (p === lastP) return; // antes o después de la sección no hay nada que mover
      lastP = p;

      // Solo re-renderiza cuando cambia el subtítulo o la capa en foco
      let s = -1;
      CAPTIONS.forEach((c, i) => { if (p >= c.at) s = i; });
      const f = p >= T.categories && p < T.not ? Math.floor((p - T.categories) / LAYER_STEP) : -1;
      setStep(s);
      setFocus(f);

      // Se lee el layout antes de escribir estilos, así el navegador no lo recalcula a mitad del frame
      const reading = p >= T.read[0] && p < T.explode[0];
      const target = reading ? head : f >= 0 ? labelRefs.current[f] : stack;
      const rect = p >= T.read[0] && target ? target.getBoundingClientRect() : null;

      const hero = placeHero(p);
      const st = placeStack(p, hero);
      placeEye(p, hero, st);
      aimEye(rect, reading, st);
    };

    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    measure();
    update();

    const ro = new ResizeObserver(() => { measure(); schedule(); });
    for (const el of [stage, title, card, cta, eye, stack]) ro.observe(el);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
    };
  }, []);

  return (
    <section ref={trackRef} aria-label="Cómo Prisma lee una noticia" className="relative h-[680svh] border-b border-border">
      {MENU_ANCHORS.map((a) => (
        <span key={a.id} id={a.id} className="absolute" style={{ top: `calc(${a.at} * (100% - 100svh))` }} />
      ))}

      <div ref={stageRef} className="sticky top-0 h-svh overflow-hidden">
        <div className="bg-grid absolute inset-0" aria-hidden="true" />

        <div ref={titleRef} className="absolute top-0 left-0 flex w-[min(100vw-2rem,40rem)] flex-col items-center gap-5 text-center will-change-transform">
          <div className="flex items-center gap-4 sm:gap-6">
            <div ref={eyeSlotRef} className="aspect-8/7 w-[min(26vw,150px)] shrink-0" aria-hidden="true" />
            <div className="flex flex-col items-start gap-1 text-left">
              <h1 className="text-6xl leading-none font-bold sm:text-8xl">PRISMA</h1>
            </div>
          </div>
          <p className="text-base leading-normal text-muted-foreground sm:text-lg">
            Prisma descompone en capas cada noticia para revelar sus matices. No impone una verdad: te enseña exactamente cómo te la están contando.
          </p>
        </div>

        <div ref={eyeRef} className="absolute top-0 left-0 w-[min(56vw,220px)] origin-center will-change-transform">
          <EyeFollower className="w-full" gaze={gaze} />
        </div>

        <div
          ref={stackRef}
          className="absolute top-0 left-0 aspect-square w-[min(72vw,300px)] origin-center will-change-transform transform-3d"
        >
          {LAYERS.map((l, i) => {
            const dimmed = focus >= 0 && focus !== i;
            return (
              <div
                key={l.id}
                ref={(el) => { layerRefs.current[i] = el; }}
                className="absolute inset-0 transform-3d"
                aria-hidden="true"
              >
                {/* la opacidad de entrada la pone el scroll; la del foco, una transición */}
                <div ref={(el) => { planeRefs.current[i] = el; }} className="absolute inset-0 opacity-0">
                  <div className={cn("absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none", dimmed && "opacity-28")}>
                    <MiniPlane x={sample.values[l.id].x} y={sample.values[l.id].y} color={l.color} />
                  </div>
                </div>
                <div
                  ref={(el) => { labelRefs.current[i] = el; }}
                  className="absolute top-[6%] left-[94%] origin-top-left whitespace-nowrap opacity-0"
                  style={{ transform: "rotateZ(calc(var(--rz) * -1)) rotateX(calc(var(--rx) * -1)) scale(var(--isc)) translate(12px, -50%)" }}
                >
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border bg-background/90 px-2 py-1 text-xs font-medium transition-opacity duration-300 motion-reduce:transition-none",
                      focus === i ? "border-foreground" : "border-border",
                      dimmed && "opacity-35",
                    )}
                  >
                    <span className="size-2 rounded-sm" style={{ background: l.color }} />
                    {l.name}
                  </span>
                </div>
              </div>
            );
          })}

          <div ref={cardRef} className="absolute -inset-x-8 top-1/2 flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Forward className="size-3.5" aria-hidden="true" />
              Reenviado muchas veces
            </p>
            <div className="relative">
              <div
                ref={scanRef}
                className="pointer-events-none absolute -inset-x-2 top-0 h-0 border-b border-foreground/40 bg-foreground/5 opacity-0"
                aria-hidden="true"
              />
              <h3 ref={headRef} className="relative text-lg leading-snug font-semibold tracking-tight">
                {sample.headline}
              </h3>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 grid sm:inset-x-6 lg:inset-x-auto lg:top-1/2 lg:bottom-auto lg:left-[max(1.5rem,calc(50%-36rem))] lg:w-88 lg:-translate-y-1/2">
          {CAPTIONS.map((c, i) => (
            <div
              key={i}
              className={cn(
                "[grid-area:1/1] self-end rounded-xl border border-border bg-card/90 p-4 backdrop-blur-md transition duration-500 motion-reduce:transition-none lg:self-center lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none",
                i === step ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
              )}
            >
              <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">{c.kicker}</p>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">{c.title}</h2>
              <div className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">{c.body}</div>
            </div>
          ))}
        </div>

        <a ref={ctaRef} href="#news" className={cn(buttonVariants({ size: "lg" }), "absolute top-0 left-0 will-change-transform")}>
          Analizar noticias
          <ArrowDown />
        </a>

        <div ref={hintRef} className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          Desliza para ver cómo la lee
          <ArrowDown className="size-3.5 animate-bounce motion-reduce:animate-none" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
