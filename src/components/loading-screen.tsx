import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import paquetesData from "@/content/paquetes.json";
import siteConfig from "@/content/site.json";

const DURATION_MS = 2700;
const WORD_INTERVAL_MS = 900;
const servicios = paquetesData.paquetes.map((p) => p.nombre);

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [percent, setPercent] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let frame: number;

    function tick(now: number) {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const pct = Math.min(100, Math.round((elapsed / DURATION_MS) * 100));
      setPercent(pct);
      if (elapsed < DURATION_MS) {
        frame = requestAnimationFrame(tick);
      } else {
        setTimeout(onDone, 300);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onDone]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % servicios.length);
    }, WORD_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col justify-between bg-background px-6 py-6 sm:px-10 sm:py-10"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        Est. 2026 / {siteConfig.ubicacion.split(",")[0]}
      </div>

      <div className="flex flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={servicios[wordIndex]}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="font-display text-3xl italic text-foreground sm:text-5xl"
          >
            {servicios[wordIndex]}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="flex justify-end font-mono text-4xl tabular-nums text-foreground sm:text-6xl">
        {String(percent).padStart(3, "0")}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-border">
        <div className="accent-gradient h-full transition-all duration-150" style={{ width: `${percent}%` }} />
      </div>
    </motion.div>
  );
}
