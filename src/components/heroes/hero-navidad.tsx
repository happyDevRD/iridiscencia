import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowDown, Gift } from "lucide-react";
import { cuposRestantes, navidad, precio, textoDescuento } from "@/lib/navidad";
import { useTonoHero } from "./usos";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Guirnalda de bombillas que cuelga de lado a lado, como las luces del set. Cada bombilla
 * titila a su ritmo. El viewBox se estira al ancho; las bombillas son círculos sueltos
 * calculados sobre la misma curva para que no se deformen.
 */
function Guirnalda() {
  const n = 15;
  // Dos tramos que caen y suben (catenaria aproximada con cuadráticas)
  const y = (t: number) => {
    const tramo = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
    return 8 + 46 * 4 * tramo * (1 - tramo);
  };
  return (
    <div className="pointer-events-none absolute inset-x-0 top-16 h-20 sm:top-20 sm:h-24" aria-hidden>
      <svg viewBox="0 0 100 70" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d="M0 8 Q25 100 50 8 Q75 100 100 8" fill="none" stroke="rgb(255 255 255 / 0.18)" strokeWidth="0.25" vectorEffect="non-scaling-stroke" />
      </svg>
      {Array.from({ length: n }, (_, i) => {
        const t = (i + 0.5) / n;
        return (
          <span
            key={i}
            className="bombilla absolute size-2.5 -translate-x-1/2 rounded-full sm:size-3"
            style={{
              left: `${t * 100}%`,
              top: `${(y(t) / 70) * 100}%`,
              animationDelay: `${(i * 0.37) % 2.6}s`,
              animationDuration: `${2.2 + ((i * 0.53) % 1.6)}s`,
            }}
          />
        );
      })}
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
          style={{
            left: `${l.x}%`,
            top: `${l.y}%`,
            width: l.s,
            height: l.s,
            background: l.c,
            animationDelay: `${l.d}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Tres fotos del set abiertas en abanico, como recién reveladas sobre la mesa. */
function Abanico() {
  const reduce = useReducedMotion();
  const [izq, centro, der] = navidad.fotos;
  const cartas = [
    { foto: izq, rot: -9, x: "-58%", y: "6%", z: 1, delay: 0.5 },
    { foto: der, rot: 8, x: "58%", y: "8%", z: 2, delay: 0.65 },
    { foto: centro, rot: -1, x: "0%", y: "0%", z: 3, delay: 0.35 },
  ];
  return (
    <div className="group relative mx-auto aspect-[4/5] w-[52%] max-w-[22rem] sm:w-[40%] lg:w-[58%]">
      {cartas.map(({ foto, rot, x, y, z, delay }) => (
        <motion.figure
          key={foto.src}
          className="absolute inset-0 overflow-hidden rounded-xl bg-white/5 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7)] ring-1 ring-white/10"
          style={{ zIndex: z }}
          initial={reduce ? false : { opacity: 0, y: 60, rotate: 0, x: "0%" }}
          animate={{ opacity: 1, y, rotate: rot, x }}
          transition={{ duration: 1.3, ease: EASE, delay }}
        >
          <img src={foto.src} alt={foto.alt} className="h-full w-full object-cover" decoding="async" />
        </motion.figure>
      ))}
    </div>
  );
}

/** Cupos del descuento como bombillas: encendidas las que quedan. */
export function Cupos({ className }: { className?: string }) {
  const total = navidad.oferta.cupos;
  const quedan = cuposRestantes();
  return (
    <div className={className}>
      <div className="flex gap-1.5" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={i < quedan ? "size-2.5 rounded-full bg-[var(--oro)] shadow-[0_0_10px_var(--oro)]" : "size-2.5 rounded-full bg-white/15"}
          />
        ))}
      </div>
      <p className="mt-2 text-sm text-white/70">
        {quedan > 0 ? `Quedan ${quedan} de ${total} cupos con descuento` : "Cupos con descuento agotados"}
      </p>
    </div>
  );
}

/**
 * Hero de temporada «Navidad en casa»: fondo cálido con bokeh, guirnalda de luces,
 * titular como el del flyer (versalitas + manuscrita) y el abanico de fotos del set.
 * Lo elige `hero.tsx` mientras el especial esté activo (`content/navidad.json`).
 */
export function HeroNavidad() {
  useTonoHero("oscuro");
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const subir = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const desde = Math.min(...navidad.paquetes.map((p) => p.precio));
  const quedan = cuposRestantes();

  return (
    <section
      ref={ref}
      id="inicio"
      className="navidad relative flex min-h-svh items-center overflow-hidden bg-[var(--noche)] pb-16 pt-36 text-white sm:pt-44 lg:pb-12"
    >
      <Bokeh />
      <Guirnalda />

      <motion.div style={{ y: subir }} className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-6">
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <motion.p
            className="antetitulo text-[var(--oro)]"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          >
            {navidad.antetitulo}
          </motion.p>

          <h1 className="mt-4 leading-none" aria-label="Navidad en casa">
            <motion.span
              aria-hidden
              className="block font-display text-[clamp(3.6rem,11vw,9rem)] font-light uppercase tracking-[0.06em]"
              initial={reduce ? false : { opacity: 0, y: 40, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "0.06em" }}
              transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
            >
              Navidad
            </motion.span>
            <motion.span
              aria-hidden
              className="-mt-[0.35em] block font-script text-[clamp(3.4rem,9vw,7.5rem)] text-[var(--oro)] lg:pl-[0.6em]"
              initial={reduce ? false : { opacity: 0, clipPath: "inset(0 100% 0 0)" }}
              animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
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
            <p className="mx-auto mt-6 hidden max-w-md text-lg sm:block leading-relaxed text-white/80 lg:mx-0">{navidad.bajada}</p>

            {quedan > 0 && (
              <div className="mx-auto mt-8 max-w-md rounded-2xl border border-[var(--oro)]/35 bg-white/[0.04] p-5 text-left backdrop-blur-sm lg:mx-0">
                <p className="flex items-start gap-3 font-medium">
                  <Gift className="mt-0.5 size-5 shrink-0 text-[var(--oro)]" aria-hidden />
                  <span>
                    Los primeros {navidad.oferta.cupos} en reservar por la web tienen {textoDescuento()}.
                  </span>
                </p>
                <Cupos className="mt-4 pl-8" />
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 lg:justify-start">
              <a
                href="#navidad"
                className="group inline-flex h-13 items-center gap-2 rounded-full bg-[var(--oro)] pl-7 pr-5 font-medium text-[var(--noche)] transition-colors hover:bg-[var(--oro-claro)]"
              >
                Reservar mi sesión navideña
                <ArrowDown className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden />
              </a>
              <p className="text-sm text-white/65">
                Desde <span className="text-white">{precio(desde)}</span>
              </p>
            </div>
          </motion.div>
        </div>

        <div className="order-1 lg:order-2">
          <Abanico />
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[var(--noche)]" aria-hidden />
    </section>
  );
}
