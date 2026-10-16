import { useEffect, useRef } from "react";

const BLADES = 7;
const R_CLOSED = 1.6; // un punto de luz, como un diafragma casi cerrado
const R_OPEN = 128; // cubre las esquinas del viewBox en cualquier proporción
const TWIST = 38; // grados que giran las láminas al abrirse
const HOLD_MS = 350;
const OPEN_MS = 1500;
const SIZE = 420;

// Mecánico: arranca suave, acelera y frena al final.
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function bladePath(r: number) {
  return `M${-SIZE} ${r}H${SIZE}V${r + SIZE}H${-SIZE}Z`;
}

/**
 * Diafragma de lente dibujado en SVG que se abre sobre la foto del Hero.
 * Cada lámina es un semiplano cuyo borde queda a distancia `r` del centro;
 * al crecer `r` y girar todas juntas, la abertura poligonal se expande igual
 * que en un lente real. Los bordes llevan el espectro iridiscente de la marca.
 *
 * `ready` indica que la foto de fondo ya cargó; mientras tanto el diafragma
 * espera casi cerrado. `onOpen` se llama al terminar.
 */
export function ApertureIntro({ ready, onOpen }: { ready: boolean; onOpen: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  useEffect(() => {
    if (!ready) return;
    const svg = svgRef.current;
    if (!svg) return;

    const groups = svg.querySelectorAll<SVGGElement>("[data-blade]");
    const paths = svg.querySelectorAll<SVGPathElement>("[data-blade] path");
    const lines = svg.querySelectorAll<SVGLineElement>("[data-blade] line");

    function draw(progress: number) {
      const r = R_CLOSED + (R_OPEN - R_CLOSED) * progress;
      const twist = TWIST * progress;
      groups.forEach((g, i) => g.setAttribute("transform", `rotate(${(i * 360) / BLADES + twist})`));
      paths.forEach((p) => p.setAttribute("d", bladePath(r)));
      lines.forEach((l) => {
        l.setAttribute("y1", String(r));
        l.setAttribute("y2", String(r));
      });
    }

    let frame = 0;
    let start: number | null = null;
    function tick(now: number) {
      start ??= now;
      const t = Math.min(1, Math.max(0, (now - start - HOLD_MS) / OPEN_MS));
      draw(easeInOutCubic(t));
      if (t < 1) frame = requestAnimationFrame(tick);
      else onOpenRef.current();
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [ready]);

  return (
    <svg
      ref={svgRef}
      aria-hidden
      viewBox="-100 -100 200 200"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
    >
      <defs>
        {/* Metal oscuro: un poco más claro junto al borde, como si le diera luz */}
        <linearGradient id="lamina" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c2a27" />
          <stop offset="0.06" stopColor="#1a1917" />
          <stop offset="1" stopColor="#121110" />
        </linearGradient>
        <linearGradient id="borde-iris" gradientUnits="userSpaceOnUse" x1="-90" y1="0" x2="90" y2="0">
          <stop offset="0" stopColor="#b7a6ff" stopOpacity="0" />
          <stop offset="0.3" stopColor="#b7a6ff" />
          <stop offset="0.45" stopColor="#7fdccb" />
          <stop offset="0.6" stopColor="#efc58c" />
          <stop offset="0.75" stopColor="#f2a0c4" />
          <stop offset="1" stopColor="#f2a0c4" stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: BLADES }, (_, i) => (
        <g key={i} data-blade transform={`rotate(${(i * 360) / BLADES})`}>
          <path d={bladePath(R_CLOSED)} fill="url(#lamina)" />
          <line
            x1={-SIZE}
            x2={SIZE}
            y1={R_CLOSED}
            y2={R_CLOSED}
            stroke="url(#borde-iris)"
            strokeWidth="0.35"
            strokeOpacity="0.8"
          />
        </g>
      ))}
    </svg>
  );
}
