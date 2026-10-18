import type { ReactNode } from "react";
import CompositionGroup from "@/components/CompositionGroup";
import { NEWS } from "@/data/news";

export const STORY_NEWS = NEWS.find((n) => n.id === "plan-seguridad") ?? NEWS[0];

type Span = readonly [number, number];

// Momentos del recorrido, como fracción del scroll de la sección (0 → 1)
export const TIMELINE = {
  hint: [0, 0.03] as Span, // se desvanece "Desliza para ver cómo la lee"
  heroOut: [0.01, 0.07] as Span, // salen el título y el botón
  captionsIn: [0.03, 0.08] as Span, // la pila se corre para dejar sitio a los subtítulos
  eyeIn: [0.02, 0.11] as Span, // el ojo sale de su hueco junto a PRISMA
  read: [0.08, 0.27] as Span, // el ojo lee el titular
  scan: [0.09, 0.27] as Span, // la franja que marca lo leído baja por el titular
  scanOut: [0.28, 0.32] as Span, // la franja desaparece
  explode: [0.28, 0.4] as Span, // el titular se separa en capas
  cardOut: [0.31, 0.4] as Span, // la tarjeta queda como rastro tenue
  categories: 0.4, // desde "Categorías"…
  not: 0.81, // …hasta "Qué no es", el foco recorre las capas una por una
  settle: 0.08, // al terminar el foco, la pila se recoge un poco
  planeDelay: 0.014, // desfase entre el inicio de cada plano (parallax)
  planeEndDelay: 0.008, // desfase entre el final de cada plano
  planeFade: 0.04, // cuánto tarda cada plano en aparecer
};

interface Caption {
  at: number;
  kicker: string;
  title: ReactNode;
  body: ReactNode;
}

export const CAPTIONS: Caption[] = [
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
    at: TIMELINE.categories,
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
            <CompositionGroup title="Temas" items={STORY_NEWS.temas.slice(0, 3)} />
          </div>
          <CompositionGroup title="Alertas" items={STORY_NEWS.alertas.slice(0, 3)} />
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
    at: TIMELINE.not,
    kicker: "Qué no es",
    title: "No es un árbitro de la verdad",
    body: "Una IA puede equivocarse o inclinarse sin querer, y las personas tampoco siempre coinciden al juzgar un sesgo. Por eso cada resultado trae su evidencia y su nivel de confianza, para que lo discutas en vez de aceptarlo sin más.",
  },
];

// Anclas del menú: caen justo después de que aparece su subtítulo
const ANCHOR_LEAD = 0.01;
export const MENU_ANCHORS = [
  { id: "how-it-works", at: CAPTIONS[0].at + ANCHOR_LEAD },
  { id: "categories", at: TIMELINE.categories + ANCHOR_LEAD },
];
