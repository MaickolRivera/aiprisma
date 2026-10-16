/**
 * Laya corriendo en el navegador del usuario (ONNX Runtime Web: WebGPU y, si no hay, WASM).
 *
 * - `laya-ts` y el modelo (~1.3 GB) se cargan solo cuando el usuario lo pide: nada de esto
 *   entra en el bundle inicial ni se descarga al abrir la página.
 * - La primera vez se descarga el modelo; después sale de CacheStorage ("laya-ts", parche
 *   cache-first en vendor/laya-ts-*.tgz).
 */

import type { Agent } from "laya-ts";
import type { AnalysisRequest, AnalysisResponse } from "@/types";
import { mapNews, type RawAnswers } from "./mapper";
import { QUESTIONS } from "./questions";

export const MIN_BODY_LENGTH = 300;

/**
 * Carpeta que sirve encoder.onnx, head.onnx, tokenizer.json y rl_agent_config.json.
 * Fijada a un commit (no `main`): los archivos no cambian sin aviso y la caché del navegador nunca queda vieja.
 */
export const MODEL_URL: string = (
  import.meta.env.VITE_LAYA_MODEL_URL ??
  "https://huggingface.co/Steven10429/laya-multilingual-webgpu/resolve/f8b540df64967067beadc96f2de23a32485c891f/"
).replace(/\/+$/, "");

let agentPromise: Promise<Agent> | null = null;
let loaded = false;

export const isLayaLoaded = () => loaded;

/** ¿El modelo ya está en CacheStorage? (entonces "cargar" no vuelve a descargar 1.3 GB) */
export async function isModelCached(): Promise<boolean> {
  try {
    if (typeof caches === "undefined") return false;
    const cache = await caches.open("laya-ts"); // misma clave que usa laya-ts
    // Se mira el archivo de pesos (~1.2 GB), no encoder.onnx (2.5 MB): si la descarga se cortó a medias, no está.
    return Boolean(await cache.match(`${MODEL_URL}/encoder.onnx.data`));
  } catch {
    return false;
  }
}

/** Carga laya-ts y el modelo una sola vez; si falla, el siguiente intento vuelve a empezar. */
export function loadLaya(): Promise<Agent> {
  agentPromise ??= (async () => {
    const { Agent } = await import("laya-ts");
    const agent = await Agent.load(MODEL_URL);
    loaded = true;
    return agent;
  })().catch((err) => {
    agentPromise = null;
    throw err;
  });
  return agentPromise;
}

// El runtime no admite dos inferencias a la vez sobre la misma sesión: se hacen en fila.
let queue: Promise<unknown> = Promise.resolve();

export function analyzeInBrowser({ new: title, body }: AnalysisRequest): Promise<AnalysisResponse> {
  // Misma regla (y mismo mensaje) que valida el backend con un 422.
  if (body.length < MIN_BODY_LENGTH) {
    return Promise.reject(new Error(`La noticia es muy corta: el cuerpo necesita al menos ${MIN_BODY_LENGTH} caracteres.`));
  }

  const run = async () => {
    const agent = await loadLaya();
    const result = await agent.predict({ new: title, body }, QUESTIONS);
    return mapNews(result.answers as RawAnswers);
  };
  const next = queue.then(run, run);
  queue = next.catch(() => undefined);
  return next;
}
