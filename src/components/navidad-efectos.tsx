import { useMemo } from "react";
import { cuposRestantes, navidad } from "@/lib/navidad";
import { cn } from "@/lib/utils";

/** Piezas decorativas del especial de Navidad (sección `navidad.tsx` y aviso del hero). */

/** Aleatorio con semilla: las partículas no cambian de sitio entre renders. */
function azar(semilla: number) {
  let s = semilla;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Destellos dorados y copos que caen despacio, con vaivén y brillo. Solo CSS: cada
 * partícula lleva su duración, retraso y deriva en variables.
 */
export function Destellos({ cantidad = 36, className }: { cantidad?: number; className?: string }) {
  const parts = useMemo(() => {
    const r = azar(7);
    return Array.from({ length: cantidad }, (_, i) => ({
      x: r() * 100,
      s: 2 + r() * 5,
      dur: 9 + r() * 12,
      delay: -r() * 20,
      deriva: (r() - 0.5) * 120,
      copo: i % 3 === 0,
      soloGrande: i % 2 === 0, // la mitad se oculta en el móvil
    }));
  }, [cantidad]);
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {parts.map((p, i) => (
        <span
          key={i}
          className={cn("destello absolute top-0", p.copo ? "destello-copo" : "destello-oro", p.soloGrande && "max-sm:hidden")}
          style={
            {
              left: `${p.x}%`,
              width: p.s,
              height: p.s,
              animationDuration: `${p.dur}s, ${2 + (i % 5) * 0.6}s`,
              animationDelay: `${p.delay}s, ${p.delay / 3}s`,
              "--deriva": `${p.deriva}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/**
 * Guirnalda de bombillas que cuelga de lado a lado, como las luces del set: se mece
 * despacio y cada bombilla titila a su ritmo. De ella cuelgan bolas que se balancean.
 */
export function Guirnalda({ className }: { className?: string }) {
  const n = 15;
  const y = (t: number) => {
    const tramo = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
    return 8 + 46 * 4 * tramo * (1 - tramo);
  };
  const bolas = [
    { t: 0.6, largo: 46, color: "var(--vino)", tam: 22 },
    { t: 0.71, largo: 26, color: "var(--oro)", tam: 16 },
    { t: 0.83, largo: 58, color: "var(--pino)", tam: 20 },
    { t: 0.94, largo: 34, color: "var(--vino)", tam: 18 },
  ];
  return (
    <div className={cn("guirnalda pointer-events-none absolute inset-x-0 h-16 sm:h-24", className)} aria-hidden>
      <svg viewBox="0 0 100 70" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d="M0 8 Q25 100 50 8 Q75 100 100 8" fill="none" stroke="rgb(255 255 255 / 0.2)" strokeWidth="0.25" vectorEffect="non-scaling-stroke" />
      </svg>
      {Array.from({ length: n }, (_, i) => {
        const t = (i + 0.5) / n;
        return (
          <span
            key={i}
            className="bombilla absolute size-2 -translate-x-1/2 rounded-full sm:size-3"
            style={{
              left: `${t * 100}%`,
              top: `${(y(t) / 70) * 100}%`,
              animationDelay: `${(i * 0.37) % 2.6}s`,
              animationDuration: `${1.8 + ((i * 0.53) % 1.6)}s`,
            }}
          />
        );
      })}
      {bolas.map((b, i) => (
        <span
          key={i}
          className="bola absolute hidden lg:block"
          style={{ left: `${b.t * 100}%`, top: `${(y(b.t) / 70) * 100}%`, animationDelay: `${-i * 0.9}s`, animationDuration: `${3.4 + i * 0.5}s` }}
        >
          <span className="mx-auto block w-px bg-white/30" style={{ height: b.largo }} />
          <span className="mx-auto block h-1.5 w-2 rounded-t-sm bg-[var(--oro)]" />
          <span
            className="block rounded-full shadow-[inset_-4px_-5px_8px_rgb(0_0_0/0.45),0_6px_14px_rgb(0_0_0/0.4)]"
            style={{
              width: b.tam,
              height: b.tam,
              background: `radial-gradient(circle at 32% 30%, rgb(255 255 255 / 0.75), transparent 28%), ${b.color}`,
            }}
          />
        </span>
      ))}
    </div>
  );
}

/** Puntos de luz desenfocados al fondo, como el bokeh de las fotos del set. */
export function Bokeh() {
  const luces = [
    { x: 8, y: 30, s: 180, c: "var(--oro)", d: 0 },
    { x: 85, y: 18, s: 240, c: "var(--vino)", d: 2 },
    { x: 70, y: 75, s: 200, c: "var(--oro)", d: 4 },
    { x: 20, y: 85, s: 260, c: "var(--vino)", d: 1 },
    { x: 48, y: 50, s: 320, c: "var(--pino)", d: 3 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {luces.map((l, i) => (
        <span
          key={i}
          className="bokeh absolute rounded-full blur-3xl"
          style={{ left: `${l.x}%`, top: `${l.y}%`, width: l.s, height: l.s, background: l.c, animationDelay: `${l.d}s` }}
        />
      ))}
    </div>
  );
}

/** Cupos del descuento como bombillas encendidas que laten en cadena. */
export function Cupos({ className, compacto }: { className?: string; compacto?: boolean }) {
  const total = navidad.oferta.cupos;
  const quedan = cuposRestantes();
  return (
    <div className={className}>
      <div className="flex gap-1.5" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={i < quedan ? "cupo size-2.5 rounded-full bg-[var(--oro)]" : "size-2.5 rounded-full bg-white/15"}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className={cn("text-white/70", compacto ? "mt-1.5 text-xs sm:text-sm" : "mt-2 text-sm")}>
        {quedan > 0 ? `Quedan ${quedan} de ${total} cupos con descuento` : "Cupos con descuento agotados"}
      </p>
    </div>
  );
}
