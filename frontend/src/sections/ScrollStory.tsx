import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, Forward } from "lucide-react";
import CompositionGroup from "@/components/CompositionGroup";
import { EyeFollower, type Gaze } from "@/components/EyeFollower";
import { MiniPlane } from "@/components/MiniPlane";
import { buttonVariants } from "@/components/ui/button";
import { LAYERS } from "@/data/layers";
import { NEWS } from "@/data/news";
import { cn } from "@/lib/utils";

const sample = NEWS.find((n) => n.id === "plan-seguridad") ?? NEWS[0];

// Momentos del recorrido, como fracción del scroll de la sección (0 → 1)
const READ: [number, number] = [0.08, 0.27]; // el ojo lee el titular
const EXPLODE: [number, number] = [0.28, 0.4]; // el titular se separa en capas
const CATEGORIES_AT = 0.4; // desde "Categorías"…
const NOT_AT = 0.81; // …hasta "Qué no es", el foco recorre las capas una por una
const LAYER_STEP = (NOT_AT - CATEGORIES_AT) / LAYERS.length; // cuánto dura el foco en cada capa

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface Caption {
  at: number;
  kicker: string;
  title: ReactNode;
  body: ReactNode;
}

const CAPTIONS: Caption[] = [
  {
    at: 0.06,
    kicker: "Cómo funciona - 1",
    title: "Pega una noticia",
    body: "Copia el texto o el enlace de algo que viste. No importa si es de un diario, un portal o una cadena de WhatsApp.",
  },
  {
    at: 0.17,
    kicker: "Cómo funciona - 2",
    title: "Laya clasifica",
    body: "Analiza el texto en varias dimensiones y, por cada una, devuelve un puntaje, qué tan segura está y la frase exacta en la que se apoyó.",
  },
  {
    at: 0.29,
    kicker: "Cómo funciona - 3",
    title: "Ves las capas",
    body: "El resultado se dibuja como flechas sobre planos apilados. Cada flecha indica hacia dónde se inclina la noticia en una dimensión.",
  },
  {
    at: CATEGORIES_AT,
    kicker: "Categorías",
    title: "Capas: ejes que se contrarrestan",
    body: "Cada capa es un plano con dos ejes y un extremo opuesto en cada uno. Laya da un valor entre -100% y +100% por eje. Una flecha larga significa una inclinación fuerte; una corta, una noticia casi neutral en esa capa.",
  },
  {
    at: 0.53,
    kicker: "Categorías",
    title: "Temas y alertas",
    body: (
      <>
        <p>
          Los temas no se oponen: se reparten y suman 100%. Las alertas son la probabilidad de que el texto use cada técnica de manipulación, así que puede haber varias altas a la vez o ninguna.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          {/* en móvil solo las alertas, para no tapar la pila */}
          <div className="max-sm:hidden">
            <CompositionGroup title="Temas" items={sample.temas.slice(0, 3)} />
          </div>
          <CompositionGroup title="Alertas" items={sample.alertas.slice(0, 3)} />
        </div>
      </>
    ),
  },
  {
    at: 0.67,
    kicker: "Qué es Prisma",
    title: "Un prisma para las noticias",
    body: "Como un prisma que separa la luz blanca en colores, descompone una noticia en sus partes para que puedas compararlas y notar patrones: qué medios empujan siempre hacia el mismo lado y qué temas llegan con miedo.",
  },
  {
    at: NOT_AT,
    kicker: "Qué no es",
    title: "No es un árbitro de la verdad",
    body: "Una IA puede equivocarse o inclinarse sin querer, y las personas tampoco siempre coinciden al juzgar un sesgo. Por eso cada resultado trae su evidencia y su nivel de confianza, para que lo discutas en vez de aceptarlo sin más.",
  },
];

export function ScrollStory() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
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
    let raf = 0;

    const update = () => {
      raf = 0;
      const track = trackRef.current!, stage = stageRef.current!, stack = stackRef.current!;
      const title = titleRef.current!, eye = eyeRef.current!, card = cardRef.current!;
      const head = headRef.current!, scan = scanRef.current!, hint = hintRef.current!;

      const vw = stage.clientWidth, vh = stage.clientHeight;
      const r = track.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - vh));
      const lg = vw >= 1024, sm = vw >= 640;

      // Solo re-renderiza cuando cambia el subtítulo o la capa en foco
      let s = -1;
      CAPTIONS.forEach((c, i) => { if (p >= c.at) s = i; });
      const f = p >= CATEGORIES_AT && p < NOT_AT ? Math.floor((p - CATEGORIES_AT) / LAYER_STEP) : -1;
      setStep(s);
      setFocus(f);

      const W = stack.offsetWidth, He = eye.offsetHeight, Ew = eye.offsetWidth;
      const Ht = title.offsetHeight, Tw = title.offsetWidth, Hc = card.offsetHeight;
      const slot = eyeSlotRef.current!;
      const g = 20;

      const titleOut = ease(seg(p, 0.01, 0.07));
      const side = ease(seg(p, 0.03, 0.08)); // entra la columna de subtítulos
      const move = ease(seg(p, READ[0], EXPLODE[1]));
      const ex = ease(seg(p, ...EXPLODE));
      const drift = reduce ? 0 : seg(p, EXPLODE[1], NOT_AT);
      const settle = seg(p, NOT_AT, NOT_AT + 0.08);

      // Tamaño y ángulo de la pila
      const sc = lerp(1, lg ? 0.88 : sm ? 0.76 : 0.6, move);
      const rx = 58 * ex;
      const rz = (45 + (reduce ? 0 : 25 * seg(p, EXPLODE[1], 1))) * ex;

      // Cada plano se separa con su propio ritmo: ese desfase es el parallax
      const gap = W * 0.22;
      const zOf = (k: number) => {
        const e = ease(seg(p, EXPLODE[0] + k * 0.014, EXPLODE[1] + k * 0.008));
        return (2 - k) * gap * e * (1 + 0.4 * drift * (1 + k * 0.15)) * (1 - 0.3 * settle);
      };
      const zTop = zOf(0);

      // Posición: al inicio la tarjeta va debajo del título (con el ojo al lado); luego se centra
      const cx = vw / 2 + (lg ? Math.min(vw * 0.18, 240) : -Math.min(28, vw * 0.07)) * side;
      const top0 = Math.max(72, (vh - (Ht + 2 * g + Hc)) / 2);
      const cy0 = top0 + Ht + 2 * g + Hc / 2;
      const cy = lerp(cy0, lg ? vh * 0.55 : vh * 0.4, move);
      const titleX = vw / 2 - Tw / 2;

      // El ojo sale de su hueco junto a PRISMA y se ubica encima de la tarjeta para leerla
      const eyeT = ease(seg(p, 0.02, READ[0] + 0.03));
      const above = sc * lerp(Hc / 2, W * (0.375 + (Math.sin((rx * Math.PI) / 180) * zTop) / W), ex);
      const readerScale = lerp(lg ? 0.85 : 0.6, lg ? 0.6 : 0.42, move);
      const es = lerp(slot.offsetWidth / Ew, readerScale, eyeT);
      const eyeX = lerp(titleX + slot.offsetLeft + slot.offsetWidth / 2, cx, eyeT);
      const eyeY = lerp(top0 + slot.offsetTop + slot.offsetHeight / 2, cy - above - g - (He * readerScale) / 2, eyeT);

      title.style.transform = `translate(${titleX}px, ${top0 - 40 * titleOut}px)`;
      title.style.opacity = String(1 - titleOut);
      title.style.visibility = titleOut >= 1 ? "hidden" : "visible";
      hint.style.opacity = String(1 - seg(p, 0, 0.03));
      hint.style.visibility = p >= 0.03 ? "hidden" : "visible";

      eye.style.transform = `translate(${eyeX - Ew / 2}px, ${eyeY - He / 2}px) scale(${es})`;

      stack.style.transform = `translate(${cx - W / 2}px, ${cy - W / 2}px) perspective(1400px) scale(${sc}) rotateX(${rx}deg) rotateZ(${rz}deg)`;
      stack.style.setProperty("--rx", `${rx}deg`);
      stack.style.setProperty("--rz", `${rz}deg`);
      stack.style.setProperty("--isc", String(1 / sc));

      // Tarjeta del titular: lectura y luego queda como rastro arriba de la pila
      const read = seg(p, READ[0] + 0.01, READ[1]);
      card.style.transform = `translateZ(${zTop}px) translateY(-50%)`;
      card.style.opacity = String(1 - 0.85 * ease(seg(p, EXPLODE[0] + 0.03, EXPLODE[1])));
      scan.style.height = `${read * 100}%`;
      scan.style.opacity = String(read > 0 ? 1 - seg(p, EXPLODE[0], EXPLODE[0] + 0.04) : 0);

      LAYERS.forEach((_, i) => {
        const layer = layerRefs.current[i], plane = planeRefs.current[i], label = labelRefs.current[i];
        if (!layer || !plane || !label) return;
        const k = i + 1;
        const vis = seg(p, EXPLODE[0] + k * 0.014, EXPLODE[0] + k * 0.014 + 0.04);
        const dim = f < 0 || f === i ? 1 : 0.28;
        layer.style.transform = `translateZ(${zOf(k)}px)`;
        plane.style.opacity = String(vis * dim);
        label.style.opacity = String(seg(ex, 0.6, 1) * (f < 0 || f === i ? 1 : 0.35));
      });

      // A dónde mira el ojo: el puntero, luego el renglón que lee, luego la capa en foco
      if (p < READ[0]) {
        gaze.current = null;
      } else if (p < EXPLODE[0]) {
        const hr = head.getBoundingClientRect();
        const lh = parseFloat(getComputedStyle(head).lineHeight) * sc || 26;
        const lines = Math.max(1, Math.round(hr.height / lh));
        const t = read * lines;
        const line = Math.min(lines - 1, Math.floor(t));
        gaze.current = {
          x: hr.left + hr.width * (0.05 + 0.9 * (t - line)),
          y: hr.top + (hr.height * (line + 0.5)) / lines,
        };
      } else {
        const target = f >= 0 ? labelRefs.current[f] : stack;
        const tr = target!.getBoundingClientRect();
        gaze.current = { x: tr.left + tr.width / 2, y: tr.top + tr.height / 2 };
      }
    };

    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <section ref={trackRef} aria-label="Cómo Prisma lee una noticia" className="relative h-[680svh] border-b border-border">
      {/* anclas del menú, ubicadas en su punto del recorrido */}
      <span id="how-it-works" className="absolute" style={{ top: "calc(0.075 * (100% - 100svh))" }} />
      <span id="categories" className="absolute" style={{ top: "calc(0.405 * (100% - 100svh))" }} />

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
          {LAYERS.map((l, i) => (
            <div
              key={l.id}
              ref={(el) => { layerRefs.current[i] = el; }}
              className="absolute inset-0 transform-3d"
              aria-hidden="true"
            >
              <div
                ref={(el) => { planeRefs.current[i] = el; }}
                className="absolute inset-0 opacity-0 transition-opacity duration-300 motion-reduce:transition-none"
              >
                <MiniPlane x={sample.values[l.id].x} y={sample.values[l.id].y} color={l.color} />
              </div>
              <div
                ref={(el) => { labelRefs.current[i] = el; }}
                className="absolute top-[6%] left-[94%] origin-top-left whitespace-nowrap opacity-0 transition-opacity duration-300 motion-reduce:transition-none"
                style={{ transform: "rotateZ(calc(var(--rz) * -1)) rotateX(calc(var(--rx) * -1)) scale(var(--isc)) translate(12px, -50%)" }}
              >
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur-sm",
                    focus === i ? "border-foreground" : "border-border",
                  )}
                >
                  <span className="size-2 rounded-sm" style={{ background: l.color }} />
                  {l.name}
                </span>
              </div>
            </div>
          ))}

          <div ref={cardRef} className="absolute inset-x-0 top-1/2 flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
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
              <h3 ref={headRef} className="relative text-lg leading-snug font-semibold tracking-tight sm:text-xl">
                {sample.headline}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">¿Es cierto? ¿Cómo te lo están contando?</p>
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
              {i === CAPTIONS.length - 1 && (
                <a href="#news" tabIndex={i === step ? 0 : -1} className={cn(buttonVariants({ size: "lg" }), "pointer-events-auto mt-5")}>
                  Analizar noticias
                  <ArrowDown />
                </a>
              )}
            </div>
          ))}
        </div>

        <div ref={hintRef} className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            Desliza para ver cómo la lee
            <ArrowDown className="size-3.5 animate-bounce motion-reduce:animate-none" aria-hidden="true" />
          </span>
          <a href="#news" className="underline-offset-4 hover:text-foreground hover:underline">
            o ve directo a las noticias
          </a>
        </div>
      </div>
    </section>
  );
}
