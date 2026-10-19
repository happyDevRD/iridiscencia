import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import siteConfig from "@/content/site.json";
import { HeroTexto } from "./compartido";
import { useFotosHero, useTonoHero } from "./usos";

const EASE = [0.22, 1, 0.36, 1] as const;
const COLUMNAS = [
  { duracion: 90, sentido: "normal" },
  { duracion: 70, sentido: "reverse" },
  { duracion: 105, sentido: "normal" },
  { duracion: 80, sentido: "reverse" },
  { duracion: 95, sentido: "normal" },
  { duracion: 75, sentido: "reverse" },
] as const;

/**
 * Hero 1 — Muro infinito: toda la pantalla es una pared de fotos inclinada en 3D,
 * con columnas que corren en sentidos opuestos. La pared sigue un poco al mouse y se
 * acerca al hacer scroll. El titular va centrado encima, sobre una sombra suave.
 */
export function HeroMuro() {
  useTonoHero("oscuro");
  const fotos = useFotosHero(36);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // Inclinación que sigue al mouse (suave)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotY = useSpring(useTransform(mx, [-1, 1], [-5, 5]), { stiffness: 60, damping: 20 });
  const rotX = useSpring(useTransform(my, [-1, 1], [24, 16]), { stiffness: 60, damping: 20 });
  // Al bajar, la pared se acerca y se oscurece
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const escala = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.25]);

  const columnas = COLUMNAS.map((_, c) => fotos.filter((_, i) => i % COLUMNAS.length === c));

  return (
    <section
      ref={ref}
      id="inicio"
      className="relative flex h-svh min-h-[640px] items-center justify-center overflow-hidden bg-tinta"
      onPointerMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
        my.set(((e.clientY - r.top) / r.height) * 2 - 1);
      }}
    >
      <div className="absolute inset-0 [perspective:1400px]" aria-hidden>
        <motion.div
          className="absolute -inset-x-[30%] -inset-y-[45%] grid grid-cols-4 gap-4 sm:grid-cols-6"
          style={{ rotateX: rotX, rotateY: rotY, rotateZ: -12, scale: escala }}
          initial={reduce ? false : { opacity: 0, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: EASE }}
        >
          {columnas.map((lista, c) => (
            <div key={c} className={c >= 4 ? "hidden sm:block" : undefined}>
              <div
                className="hero-columna flex flex-col gap-4"
                style={{ animationDuration: `${COLUMNAS[c].duracion}s`, animationDirection: COLUMNAS[c].sentido }}
              >
                {[...lista, ...lista].map((foto, i) => (
                  <div
                    key={`${foto.src}-${i}`}
                    className="overflow-hidden rounded-lg bg-white/5"
                    style={{ aspectRatio: foto.w && foto.h ? `${foto.w} / ${foto.h}` : "4 / 5" }}
                  >
                    <img src={foto.thumb} alt="" loading={i < 4 ? "eager" : "lazy"} decoding="async" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Sombra para leer el titular: más densa en el centro, sin apagar del todo el muro */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgb(0_0_0/0.82),rgb(0_0_0/0.58)_70%,rgb(0_0_0/0.68))]"
      />

      <HeroTexto oscuro centrado className="relative z-10 max-w-5xl px-5" />

      {/* Firma del estudio: abajo a la derecha en escritorio, centrada abajo en el móvil */}
      <motion.p
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.1 }}
        className="antetitulo absolute inset-x-0 bottom-6 z-10 text-center text-[0.65rem] text-white/70 sm:text-xs lg:inset-x-auto lg:bottom-10 lg:right-12 lg:text-right"
      >
        Estudio de fotografía · {siteConfig.ubicacion.split(",")[0]}
      </motion.p>
    </section>
  );
}
