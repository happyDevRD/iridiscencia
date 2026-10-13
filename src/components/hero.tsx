import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import siteConfig from "@/content/site.json";
import paquetesData from "@/content/paquetes.json";
import { Button } from "@/components/ui/button";
import { useVideoLoopWindow } from "@/hooks/use-video-loop-window";

// TODO: reemplazar por metraje real del estudio — este es un placeholder de stock.
export const HERO_VIDEO_URL =
  "https://res.cloudinary.com/deaqhxfwf/video/upload/v1781826138/A_cinematic_dolly_zoom_shot_moving_forward_into_a_-1781826029435_byivrw.mp4";

// Tramo estable "adentro" del lente de este clip de stock (dolly zoom de ida y
// vuelta) — ajustar si se reemplaza por metraje real con otro timing.
export const HERO_VIDEO_LOOP_START = 2.0;
export const HERO_VIDEO_LOOP_END = 3.3;

const servicios = paquetesData.paquetes.map((p) => p.nombre);

export function Hero({ active }: { active: boolean }) {
  const [index, setIndex] = useState(0);
  const videoRef = useVideoLoopWindow(HERO_VIDEO_LOOP_START, HERO_VIDEO_LOOP_END);

  useEffect(() => {
    const interval = setInterval(() => setIndex((i) => (i + 1) % servicios.length), 2200);
    return () => clearInterval(interval);
  }, []);

  // El video arranca recién cuando el Hero es visible (loading screen ya se
  // quitó) — si arrancara con autoPlay desde el montaje, para cuando el
  // usuario ve el Hero el "snap" de ancho a adentro del lente ya pasó y solo
  // se percibe el loop interno, sin la sensación de "entrar a la cámara".
  useEffect(() => {
    if (active) videoRef.current?.play();
  }, [active, videoRef]);

  return (
    <section id="inicio" className="relative flex min-h-screen items-center overflow-hidden">
      <video
        ref={videoRef}
        src={HERO_VIDEO_URL}
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-32 text-center [text-shadow:0_2px_20px_rgb(0_0_0_/_0.5)]">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs tracking-[0.25em] text-white/80 uppercase"
        >
          {siteConfig.ubicacion.split(",")[0]} / Portafolio &apos;26
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-6 font-display text-6xl italic text-white sm:text-8xl"
        >
          {siteConfig.nombre}
        </motion.h1>

        <div className="mt-4 h-8 text-lg text-white/85 sm:text-xl">
          <AnimatePresence mode="wait">
            <motion.span
              key={servicios[index]}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="inline-block"
            >
              {servicios[index]}
            </motion.span>
          </AnimatePresence>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mt-6 max-w-xl text-white/75"
        >
          {siteConfig.descripcion}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex justify-center gap-4"
        >
          <a href="#proyectos">
            <Button size="lg">Ver Proyectos</Button>
          </a>
          <a href="#contacto">
            <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
              Agendar Sesión
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
