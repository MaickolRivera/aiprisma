import type { Layer } from "@/types";

export const LAYERS: Layer[] = [
    {
    id: "sustento",
    name: "Sustento",
    color: "#25A07A",
    x: ["hechos", "opinión"],
    y: ["fuentes verificables", "sin fuentes"],
  },
  {
    id: "tono",
    name: "Tono",
    color: "#E3A512",
    x: ["sobrio", "sensacionalista"],
    y: ["esperanza", "miedo"],
  },
  {
    id: "intencion",
    name: "Intención",
    color: "#3D7BE0",
    x: ["informar", "persuadir"],
    y: ["equilibrado", "de un solo lado"],
  },
  {
    id: "politica",
    name: "Política",
    color: "#E2574C",
    x: ["izquierda", "derecha"],
    y: ["libertario", "autoritario"],
  },

];

export const LAYER_BY_ID = Object.fromEntries(LAYERS.map((l) => [l.id, l])) as Record<
  Layer["id"],
  Layer
>;
