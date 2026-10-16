import type { Layer } from "@/types";

export const LAYERS: Layer[] = [
    {
    id: "sustento",
    name: "Sustento",
    color: "#25A07A",
    x: ["hechos", "opinión"],
    y: ["fuentes verificables", "sin fuentes"],
    description: "Qué tan respaldado está: hechos u opinión, y si cita fuentes verificables.",
  },
  {
    id: "tono",
    name: "Tono",
    color: "#E3A512",
    x: ["sobrio", "sensacionalista"],
    y: ["esperanza", "miedo"],
    description: "Cómo te quiere hacer sentir: sobrio o exagerado, esperanza o miedo.",
  },
  {
    id: "intencion",
    name: "Intención",
    color: "#3D7BE0",
    x: ["informar", "persuadir"],
    y: ["equilibrado", "de un solo lado"],
    description: "Si busca informar o convencer, y si da voz a varias partes.",
  },
  {
    id: "politica",
    name: "Política",
    color: "#E2574C",
    x: ["izquierda", "derecha"],
    y: ["libertario", "autoritario"],
    description: "Hacia dónde empuja el texto en lo económico y en lo social.",
  },

];

export const LAYER_BY_ID = Object.fromEntries(LAYERS.map((l) => [l.id, l])) as Record<
  Layer["id"],
  Layer
>;
