/**
 * Convierte las respuestas crudas de Laya en el formato que dibuja la interfaz.
 * Port 1:1 de `backend/app/api/mappers/layers.py` y `news.py`.
 */

import type { AnalysisResponse, LayerId, LayerReading } from "@/types";
import { EJES } from "./questions";

/** Lo mínimo que se lee de cada respuesta de Laya (`choice` y `noul`). */
export interface RawAnswer {
  noul?: number;
  confidence?: number;
  probabilities?: Record<string, number>;
}
export type RawAnswers = Record<string, RawAnswer>;

const CAPAS: LayerId[] = ["politica", "intencion", "tono", "sustento"];

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Respuesta `noul` de una pregunta; falla con un mensaje claro si Laya no la devolvió. */
function noul(answers: RawAnswers, key: string): number {
  const v = answers[key]?.noul;
  if (typeof v !== "number") throw new Error(`Laya no devolvió la respuesta "${key}".`);
  return v;
}

/** Valor de un eje entre -1 y 1. */
export function axisValue(answers: RawAnswers, eje: string): number {
  const [negQuestion] = EJES[eje];
  const pos = noul(answers, `${eje}_pos`);

  if (negQuestion === null) return 2 * pos - 1; // eje de un polo

  return pos - noul(answers, `${eje}_neg`); // eje de dos polos
}

/** Promedio de la `confidence` de las preguntas de un eje (1 o 2). */
export function axisConfidence(answers: RawAnswers, eje: string): number {
  const keys = [`${eje}_pos`, `${eje}_neg`].filter((k) => k in answers);
  const values = keys.map((k) => answers[k].confidence ?? 0);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Posición de una capa, por ejemplo "tono" -> { x: 0.8, y: 0.41, c: 0.79 }. */
export function mapLayer(answers: RawAnswers, capa: LayerId): LayerReading {
  const x = axisValue(answers, `${capa}_x`);
  const y = axisValue(answers, `${capa}_y`);

  // La confianza de la capa es el promedio de la confianza de sus dos ejes.
  let c = (axisConfidence(answers, `${capa}_x`) + axisConfidence(answers, `${capa}_y`)) / 2;

  // Si la noticia no trata un tema político, la capa Política no es confiable
  // aunque el modelo haya respondido con seguridad.
  if (capa === "politica") c *= noul(answers, "politica_aplica");

  return { x: round2(x), y: round2(y), c: round2(c) };
}

export function mapLayers(answers: RawAnswers): Record<LayerId, LayerReading> {
  return Object.fromEntries(CAPAS.map((capa) => [capa, mapLayer(answers, capa)])) as Record<LayerId, LayerReading>;
}

/** Temas ordenados de mayor a menor: [["economia", 0.55], ...] (máximo 5). */
export function mapTemas(answers: RawAnswers): [string, number][] {
  const probabilities = answers["tema"]?.probabilities;
  if (!probabilities) throw new Error('Laya no devolvió la respuesta "tema".');

  return Object.entries(probabilities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tema, prob]) => [tema, round2(prob)]);
}

/** Alertas de mayor a menor: [["miedo", 0.85], ...] (máximo 5). */
export function mapAlertas(answers: RawAnswers): [string, number][] {
  return Object.entries(answers)
    .filter(([nombre]) => nombre.startsWith("alerta_"))
    .map(([nombre, r]): [string, number] => [nombre.slice("alerta_".length), round2(r.noul ?? 0)])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}

/** Respuesta final del análisis, igual a la de `POST /analysis`. */
export function mapNews(answers: RawAnswers): AnalysisResponse {
  return {
    values: mapLayers(answers),
    temas: mapTemas(answers),
    alertas: mapAlertas(answers),
  };
}
