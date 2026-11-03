import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { FadeUp } from "@/components/motion";

const TEXTO =
  "Somos un estudio de fotografía en San Pedro de Macorís. Bodas, XV años, maternidad y retratos: cuidamos cada detalle para que tus fotos se sientan como tú, hoy y dentro de muchos años.";
const CURSIVA = new Set(["como", "tú,"]);

/**
 * Respiro sin fotos entre el muro del hero y el portafolio: un párrafo grande cuyas palabras
 * se encienden al bajar. No fija el scroll; en el teléfono se baja como el resto.
 */
export function Manifiesto() {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.7"] });
  const palabras = TEXTO.split(" ");

  return (
    <section aria-label="El estudio" className="mx-auto max-w-5xl px-5 pb-4 pt-24 sm:px-8 sm:pt-32">
      <FadeUp>
        <p className="antetitulo text-muted-foreground">El estudio</p>
      </FadeUp>
      <p ref={ref} className="mt-6 font-display text-[clamp(1.85rem,4.6vw,3.6rem)] leading-[1.18] tracking-tight" aria-label={TEXTO}>
        {palabras.map((p, i) => (
          <Palabra key={i} texto={p} i={i} total={palabras.length} progress={scrollYProgress} quieta={!!reduce} />
        ))}
      </p>
    </section>
  );
}

function Palabra({
  texto,
  i,
  total,
  progress,
  quieta,
}: {
  texto: string;
  i: number;
  total: number;
  progress: MotionValue<number>;
  quieta: boolean;
}) {
  // Con función y no con rango en array: así motion no la acelera con ScrollTimeline (se desfasaba).
  const opacity = useTransform(progress, (v) => {
    if (quieta) return 1;
    const t = (v * total - i) / 1.5;
    return 0.16 + 0.84 * Math.min(1, Math.max(0, t));
  });
  return (
    <motion.span aria-hidden style={{ opacity }} className={CURSIVA.has(texto) ? "italic" : undefined}>
      {texto}{" "}
    </motion.span>
  );
}
