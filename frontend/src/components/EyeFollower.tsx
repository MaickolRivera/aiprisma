import { useEffect, useRef, useState, type RefObject } from "react";

const PX = 10;

const BRACKET = [
  "####",
  "####",
  "##..",
  "##..",
  "##..",
  "##..",
  "##..",
  "##..",
  "##..",
  "##..",
  "##..",
  "##..",
  "####",
  "####",
];

const O_OPEN = [
  "..####..",
  ".######.",
  "##....##",
  "##....##",
  "##....##",
  "##....##",
  "##....##",
  "##....##",
  ".######.",
  "..####..",
];

const O_CLOSED = [
  "........",
  "........",
  "........",
  "........",
  "########",
  "########",
  "........",
  "........",
  "........",
  "........",
];

function Pixels({ map, x, y, mirror = false }: { map: string[]; x: number; y: number; mirror?: boolean }) {
  return map.flatMap((row, r) =>
    [...row].map((c, i) =>
      c === "#" ? (
        <rect key={`${r}-${i}`} x={(x + (mirror ? row.length - 1 - i : i)) * PX} y={(y + r) * PX} width={PX} height={PX} />
      ) : null,
    ),
  );
}

export type Gaze = { x: number; y: number } | null;

// `gaze` (opcional): punto en la ventana al que mira el ojo; si es null, sigue al puntero
export function EyeFollower({ className, gaze }: { className?: string; gaze?: RefObject<Gaze> }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pupilRef = useRef<SVGGElement>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const svg = svgRef.current;
    const pupil = pupilRef.current;
    if (!svg || !pupil) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let px: number | null = null, py = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
    };

    const aim = () => {
      const g = gaze?.current ?? (px === null ? null : { x: px, y: py });
      if (!g) return;
      const r = svg.getBoundingClientRect();
      const dx = g.x - (r.left + r.width / 2);
      const dy = g.y - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, d / 280); // cerca del ojo, la O se mueve menos
      tx = (dx / d) * 4 * reach; // en píxeles: hasta 4 a los lados
      ty = (dy / d) * 2 * reach; // y 2 arriba/abajo
    };

    const loop = () => {
      aim();
      const k = reduce ? 1 : 0.14;
      cx += (tx - cx) * k;
      cy += (ty - cy) * k;
      // Redondeo a píxel entero para que el movimiento sea escalonado
      pupil.setAttribute("transform", `translate(${Math.round(cx) * PX} ${Math.round(cy) * PX})`);
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(loop);

    let blinkTimer = 0;
    let openTimer = 0;
    if (!reduce) {
      const scheduleBlink = () => {
        blinkTimer = window.setTimeout(() => {
          setClosed(true);
          openTimer = window.setTimeout(() => {
            setClosed(false);
            scheduleBlink();
          }, 140);
        }, 3500 + Math.random() * 3000);
      };
      scheduleBlink();
    }

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      clearTimeout(blinkTimer);
      clearTimeout(openTimer);
    };
  }, [gaze]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 320 200"
      className={className}
      aria-hidden="true"
      focusable="false"
      shapeRendering="crispEdges"
      fill="var(--foreground)"
    >
      <Pixels map={BRACKET} x={2} y={3} />
      <Pixels map={BRACKET} x={26} y={3} mirror />
      <g ref={pupilRef}>
        <Pixels map={closed ? O_CLOSED : O_OPEN} x={12} y={5} />
      </g>
    </svg>
  );
}
