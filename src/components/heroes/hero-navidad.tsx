import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowDown, Gift } from "lucide-react";
import { cuposRestantes, navidad, precio, precioConDescuento, textoDescuento } from "@/lib/navidad";
import { cn } from "@/lib/utils";
import { useTonoHero } from "./usos";

const EASE = [0.22, 1, 0.36, 1] as const;

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
function Guirnalda() {
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
    <div className="guirnalda pointer-events-none absolute inset-x-0 top-14 h-16 sm:top-20 sm:h-24" aria-hidden>
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
function Bokeh() {
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

const CARTAS = [
  { rot: -9, x: "-58%", y: "6%", z: 1, delay: 0.5, flota: 0.4, inicial: 1 },
  { rot: 8, x: "58%", y: "8%", z: 2, delay: 0.65, flota: 1.3, inicial: 2 },
  { rot: -1, x: "0%", y: "0%", z: 3, delay: 0.35, flota: 0, inicial: 0 },
];
/** Orden en que cambian las cartas: centro, izquierda, derecha. */
const TURNOS = [2, 0, 1];

/**
 * Tres fotos del set en abanico que flotan y van cambiando: cada pocos segundos una
 * de las cartas se funde con otra foto del set.
 */
function Abanico() {
  const reduce = useReducedMotion();
  const fotos = navidad.fotos;
  const [paso, setPaso] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setPaso((p) => p + 1), 2600);
    return () => window.clearInterval(id);
  }, [reduce]);

  /** Veces que ha cambiado la carta `c` en `paso` pasos. */
  const cambios = (c: number) => {
    const turno = TURNOS.indexOf(c);
    return paso > turno ? Math.floor((paso - turno - 1) / 3) + 1 : 0;
  };

  return (
    <div className="relative mx-auto aspect-[4/5] h-[30svh] max-h-[26rem] sm:h-[34svh] lg:h-auto lg:w-[58%] lg:max-w-[22rem]">
      {CARTAS.map(({ rot, x, y, z, delay, flota, inicial }, c) => {
        const foto = fotos[(inicial + cambios(c) * 3) % fotos.length];
        return (
          <motion.div
            key={c}
            className="absolute inset-0"
            style={{ zIndex: z }}
            initial={reduce ? false : { opacity: 0, y: 60, rotate: 0, x: "0%" }}
            animate={{ opacity: 1, y, rotate: rot, x }}
            transition={{ duration: 1.3, ease: EASE, delay }}
          >
            <figure
              className="flotar relative h-full w-full overflow-hidden rounded-xl bg-[var(--noche-2)] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7)] ring-1 ring-white/10"
              style={{ animationDelay: `${-flota}s` }}
            >
              <AnimatePresence initial={false}>
                <motion.img
                  key={foto.src}
                  src={foto.src}
                  alt={c === 2 ? foto.alt : ""}
                  className="absolute inset-0 h-full w-full object-cover"
                  decoding="async"
                  initial={{ opacity: 0, scale: 1.12 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: EASE }}
                />
              </AnimatePresence>
              {/* Reflejo que cruza la foto de vez en cuando */}
              <span className="reflejo pointer-events-none absolute inset-0" style={{ animationDelay: `${c * 1.7}s` }} aria-hidden />
            </figure>
          </motion.div>
        );
      })}
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

/**
 * Hero de temporada «Navidad en casa»: fondo cálido con bokeh y destellos que caen,
 * guirnalda que se mece, titular como el del flyer (versalitas + manuscrita con brillo)
 * y el abanico de fotos del set. En el móvil todo cabe en una pantalla.
 * Lo elige `hero.tsx` mientras el especial esté activo (`content/navidad.json`).
 */
export function HeroNavidad() {
  useTonoHero("oscuro");
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const subir = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const minimo = Math.min(...navidad.paquetes.map((p) => p.precio));
  const desde = precioConDescuento(minimo) ?? minimo;
  const quedan = cuposRestantes();

  return (
    <section
      ref={ref}
      id="inicio"
      className="navidad relative flex h-svh min-h-[560px] items-center overflow-hidden bg-[var(--noche)] pb-4 pt-[4.5rem] text-white sm:pt-24 lg:h-auto lg:min-h-svh lg:pb-12 lg:pt-44"
    >
      <Bokeh />
      <Destellos />
      <Guirnalda />

      <motion.div
        style={{ y: subir }}
        className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-5 px-5 sm:gap-8 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-6"
      >
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <motion.p
            className="antetitulo text-[0.65rem] text-[var(--oro)] sm:text-xs"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          >
            {navidad.antetitulo}
          </motion.p>

          <h1 className="mt-2 leading-none sm:mt-4" aria-label="Navidad en casa">
            <span aria-hidden className="block whitespace-nowrap font-display text-[clamp(3rem,11vw,9rem)] font-light uppercase [perspective:600px]">
              {"Navidad".split("").map((l, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={reduce ? false : { opacity: 0, y: "0.4em", rotateX: -80, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                  transition={{ duration: 1, ease: EASE, delay: 0.2 + i * 0.07 }}
                  style={{ marginRight: i < 6 ? "0.06em" : 0 }}
                >
                  {l}
                </motion.span>
              ))}
            </span>
            <motion.span
              aria-hidden
              className="brillo-oro -mt-[0.35em] block font-script text-[clamp(2.9rem,9vw,7.5rem)] lg:pl-[0.6em]"
              initial={reduce ? false : { opacity: 0, clipPath: "inset(0 100% 0 0)" }}
              animate={{ opacity: 1, clipPath: "inset(0 -10% 0 0)" }}
              transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1], delay: 0.9 }}
            >
              en casa
            </motion.span>
          </h1>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 1.2 }}
          >
            <p className="mx-auto mt-6 hidden max-w-md text-lg leading-relaxed text-white/80 sm:block lg:mx-0">{navidad.bajada}</p>

            {quedan > 0 && (
              <div className="oferta-borde relative mx-auto mt-4 max-w-md rounded-2xl bg-white/[0.04] p-3.5 text-left backdrop-blur-sm sm:mt-8 sm:p-5 lg:mx-0">
                <p className="flex items-start gap-3 text-sm font-medium sm:text-base">
                  <Gift className="regalo mt-0.5 size-5 shrink-0 text-[var(--oro)]" aria-hidden />
                  <span>
                    Los primeros {navidad.oferta.cupos} en reservar por la web tienen {textoDescuento()}.
                  </span>
                </p>
                <Cupos compacto className="mt-2.5 pl-8 sm:mt-4" />
              </div>
            )}

            <div className="mt-4 flex flex-col items-center gap-2 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-4 lg:justify-start">
              <a
                href="#navidad"
                className="brillo-boton group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-[var(--oro)] pl-7 pr-5 font-medium text-[var(--noche)] transition-colors hover:bg-[var(--oro-claro)] sm:h-13"
              >
                Reservar mi sesión navideña
                <ArrowDown className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden />
              </a>
              <p className="text-xs text-white/65 sm:text-sm">
                Desde <span className="text-white">{precio(desde)}</span>
                {desde !== minimo && " con el descuento"}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="order-1 lg:order-2">
          <Abanico />
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[var(--noche)]" aria-hidden />
    </section>
  );
}
