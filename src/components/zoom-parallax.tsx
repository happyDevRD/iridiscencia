import { useMemo, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useGaleria } from "@/lib/gallery";
import { conRelleno, fotosDeGaleria, type Foto } from "@/lib/fotos";

/**
 * Siete fotos que se abren desde el centro mientras bajas: la del medio termina
 * a pantalla completa. Posición y tamaño de cada una, en % de la pantalla.
 */
const CAPAS = [
  { w: 25, h: 25, top: 0, left: 0, zoom: 4 },
  { w: 35, h: 30, top: -30, left: 5, zoom: 5 },
  { w: 20, h: 45, top: -10, left: -25, zoom: 6 },
  { w: 25, h: 25, top: 0, left: 27.5, zoom: 5 },
  { w: 20, h: 25, top: 27.5, left: 5, zoom: 6 },
  { w: 30, h: 25, top: 27.5, left: -22.5, zoom: 8 },
  { w: 15, h: 15, top: 22.5, left: 25, zoom: 9 },
];

function Capa({ foto, capa, progress, i }: { foto: Foto; capa: (typeof CAPAS)[number]; progress: MotionValue<number>; i: number }) {
  const scale = useTransform(progress, [0, 1], [1, capa.zoom]);
  return (
    <motion.div style={{ scale }} className="absolute inset-0 flex items-center justify-center">
      <div
        className="relative overflow-hidden rounded-lg"
        style={{ width: `${capa.w}vw`, height: `${capa.h}vh`, top: `${capa.top}vh`, left: `${capa.left}vw` }}
      >
        <img
          src={i === 0 ? foto.src : foto.thumb}
          alt={i === 0 ? foto.alt : ""}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
    </motion.div>
  );
}

export function ZoomParallax() {
  const manifest = useGaleria();
  const fotos = useMemo(() => (manifest === undefined ? [] : conRelleno(fotosDeGaleria(manifest).slice(1), 7)), [manifest]);
  const reduce = useReducedMotion();

  if (fotos.length < CAPAS.length) return null;

  // Sin animación: un mosaico quieto con las mismas fotos.
  if (reduce) {
    return (
      <section aria-label="Fotos destacadas" className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-5 py-16 sm:grid-cols-3 sm:px-8">
        {fotos.slice(0, 6).map((f) => (
          <img key={f.src} src={f.thumb} alt="" loading="lazy" className="aspect-[4/5] w-full rounded-lg object-cover" />
        ))}
      </section>
    );
  }

  return <Escena fotos={fotos} />;
}

/** Se monta solo con las fotos ya cargadas: `useScroll` necesita la sección desde el inicio. */
function Escena({ fotos }: { fotos: Foto[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const textoOpacity = useTransform(scrollYProgress, [0.72, 0.9], [0, 1]);
  const textoY = useTransform(scrollYProgress, [0.72, 0.9], [30, 0]);

  return (
    <section ref={ref} aria-label="Fotos destacadas" data-parada="inicio fin" className="relative h-[300vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        {fotos.map((foto, i) => (
          <Capa key={foto.src} foto={foto} capa={CAPAS[i]} progress={scrollYProgress} i={i} />
        ))}
        <motion.div
          style={{ opacity: textoOpacity, y: textoY }}
          className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-5 pb-12 pt-32 text-center text-white sm:pb-16"
        >
          <p className="antetitulo text-white/80">{fotos[0].categoria}</p>
          <p className="mt-3 font-display text-4xl sm:text-6xl">
            Cada historia, <span className="italic">en grande</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
