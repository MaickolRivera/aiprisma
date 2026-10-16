import { buttonVariants } from "@/components/ui/button";
import type { LayaStatus } from "@/lib/laya/useLaya";

interface Props {
  status: LayaStatus;
  error: string | null;
  cached: boolean;
  elapsed: number;
  onLoad: () => void;
}

export function ModelLoader({ status, error, cached, elapsed, onLoad }: Props) {
  return (
    <div className="mt-8 rounded-xl border border-border bg-card p-4 text-sm" role="status" aria-live="polite">
      {status === "ready" ? (
        <p>
          <span className="font-medium">Laya lista.</span>{" "}
          <span className="text-muted-foreground">El análisis corre en tu navegador: el texto no sale de tu equipo.</span>
        </p>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            {status === "loading" ? (
              <>
                {cached ? "Activando Laya…" : "Descargando y activando Laya…"} {elapsed}s. Puede tardar unos minutos; no cierres la pestaña.
              </>
            ) : cached ? (
              "Laya ya está guardada en este navegador. Actívala para analizar noticias!"
            ) : (
              "Laya corre en tu navegador. Pesa ~1.3 GB: se descarga una sola vez y queda guardada."
            )}
          </p>
          <button
            type="button"
            onClick={onLoad}
            disabled={status === "loading"}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {status === "loading" ? "Cargando…" : status === "error" ? "Reintentar" : cached ? "Activar Laya" : "Descargar y activar Laya"}
          </button>
        </div>
      )}
      {status === "loading" && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border" aria-hidden="true">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-foreground/60" />
        </div>
      )}
      {status === "error" && error && <p className="mt-3 text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
