import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Puntos del óvalo en una caja de 0..1: no cierra del todo y se pasa un poco. */
const OVALO = [
  [0.81, 0.12], [0.59, -0.02], [0.17, 0.02], [0.06, 0.38],
  [-0.02, 0.68], [0.2, 0.96], [0.6, 0.94], [0.89, 0.92],
  [1.03, 0.64], [0.95, 0.36], [0.88, 0.12], [0.73, 0.04], [0.59, 0.08],
];

function ovalo(w: number, h: number) {
  const p = OVALO.map(([x, y]) => `${(x * w).toFixed(1)} ${(y * h).toFixed(1)}`);
  return `M${p[0]}C${p[1]} ${p[2]} ${p[3]}S${p[5]} ${p[6]}S${p[8]} ${p[9]}S${p[11]} ${p[12]}`;
}

/**
 * Óvalo de lápiz graso, como cuando el fotógrafo marca una foto en la hoja de
 * contactos. Se dibuja con `dibujado` o al pasar sobre un `.group`. El trazado
 * se calcula al tamaño real para que el grosor sea parejo en cualquier caja.
 */
export function Trazo({ dibujado, className }: { dibujado?: boolean; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [caja, setCaja] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setCaja({ w: Math.round(width), h: Math.round(height) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      aria-hidden
      viewBox={caja ? `0 0 ${caja.w} ${caja.h}` : undefined}
      className={cn("trazo pointer-events-none absolute overflow-visible", dibujado && "is-dibujado", className)}
    >
      {caja && caja.w > 0 && (
        <path
          d={ovalo(caja.w, caja.h)}
          pathLength={1}
          fill="none"
          stroke="var(--lapiz)"
          strokeWidth={Math.max(2.5, Math.min(4, caja.h / 40))}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

/** Marca de verificación a lápiz para la hoja de pedido. */
export function Visto({ dibujado }: { dibujado: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 40 40" className={cn("trazo absolute -inset-1.5 overflow-visible", dibujado && "is-dibujado")}>
      <path
        d="M6 22c5 3 8 7 10 11C20 22 27 11 37 3"
        pathLength={1}
        fill="none"
        stroke="var(--lapiz)"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Activa el revelado cuando el elemento entra en pantalla y la imagen ya cargó. */
function useRevelado<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

type FotogramaProps = {
  src: string;
  alt: string;
  numero: number;
  width?: number;
  height?: number;
  /** Retardo del revelado, para que una tira se revele foto a foto. */
  retardo?: number;
  marcado?: boolean;
  eager?: boolean;
  className?: string;
};

/** Un fotograma: la foto recortada al formato de la tira y su número impreso debajo. */
export function Fotograma({ src, alt, numero, width, height, retardo = 0, marcado, eager, className }: FotogramaProps) {
  const { ref, visible } = useRevelado<HTMLDivElement>();
  const [cargada, setCargada] = useState(false);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-black">
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setCargada(true)}
          ref={(img) => {
            if (img?.complete && img.naturalWidth > 0) setCargada(true);
          }}
          style={{ "--retardo": `${retardo}ms` } as React.CSSProperties}
          className={cn(
            "revelar h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]",
            visible && cargada && "is-revelada"
          )}
        />
      </div>
      <Trazo dibujado={marcado} className="-inset-x-[9%] -inset-y-[7%] h-[114%] w-[118%]" />
      <p className="borde-impreso mt-2 flex justify-between" aria-hidden>
        <span>{numero}</span>
        <span>▸ {numero}A</span>
      </p>
    </div>
  );
}

/** Fotograma sin exponer: el final del rollo, para que una tira corta no quede coja. */
export function FotogramaVacio({ numero }: { numero: number }) {
  return (
    <div aria-hidden>
      <div className="sin-exponer aspect-[4/5]" />
      <p className="borde-impreso mt-2 flex justify-between opacity-50">
        <span>{numero}</span>
        <span>▸ {numero}A</span>
      </p>
    </div>
  );
}

/** Tira de película con perforaciones y el borde impreso de la marca. */
export function Tira({ children, rotulo, className }: { children: ReactNode; rotulo?: string; className?: string }) {
  return (
    <div className={cn("pelicula", className)}>
      {rotulo && (
        <p className="borde-impreso absolute left-4 top-[18px] hidden sm:block" aria-hidden>
          {rotulo}
        </p>
      )}
      {children}
    </div>
  );
}
