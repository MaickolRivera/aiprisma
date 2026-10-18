// Ayudas para animaciones guiadas por scroll (todo en fracciones 0 → 1)

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

/** Progreso de `p` dentro del tramo [a, b] */
export const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

/** Suaviza la entrada y la salida (smoothstep) */
export const ease = (t: number) => t * t * (3 - 2 * t);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
