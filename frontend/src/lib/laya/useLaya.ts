import { useCallback, useEffect, useState } from "react";
import { isLayaLoaded, isModelCached, loadLaya } from "./engine";

export type LayaStatus = "idle" | "loading" | "ready" | "error";

/** Estado de carga del modelo en el navegador. `load()` lo descarga (si hace falta) y lo activa. */
export function useLaya() {
  const [status, setStatus] = useState<LayaStatus>(isLayaLoaded() ? "ready" : "idle");
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let alive = true;
    isModelCached().then((v) => alive && setCached(v));
    return () => {
      alive = false;
    };
  }, []);

  // El runtime no reporta bytes descargados: se muestra el tiempo transcurrido.
  useEffect(() => {
    if (status !== "loading") return;
    setElapsed(0);
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      await loadLaya();
      setStatus("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el modelo.");
      setStatus("error");
    }
  }, []);

  return { status, error, cached, elapsed, load };
}
