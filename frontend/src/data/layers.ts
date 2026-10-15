import type { Layer } from "@/types";

export const LAYERS: Layer[] = [
  {
    id: "politica",
    name: "Política",
    color: "#E2574C",
    x: ["izquierda", "derecha"],
    y: ["libertario", "autoritario"],
    description: "Hacia dónde empuja el texto en lo económico y en lo social.",
  },
  {
    id: "intencion",
    name: "Intención",
    color: "#3D7BE0",
    x: ["informar", "entretener"],
    y: ["neutral", "polémico"],
    description: "Si busca informar o entretener, y qué tan polémico es.",
  },
  {
    id: "tono",
    name: "Tono",
    color: "#E3A512",
    x: ["racional", "emocional"],
    y: ["esperanza", "miedo"],
    description: "El tono: razón o emoción, esperanza o miedo.",
  },
  {
    id: "sustento",
    name: "Sustento",
    color: "#25A07A",
    x: ["hechos", "opinión"],
    y: ["local", "global"],
    description: "Si se apoya en hechos o en opinión, y qué tan local o global es.",
  },
];

export const LAYER_BY_ID = Object.fromEntries(LAYERS.map((l) => [l.id, l])) as Record<
  Layer["id"],
  Layer
>;
