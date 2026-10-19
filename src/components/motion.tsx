import { motion, useInView, useReducedMotion } from "motion/react";
import { Fragment, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Titular que entra palabra por palabra, cada una subiendo desde detrás de una
 * máscara. El texto completo queda en `aria-label` para lectores de pantalla.
 */
export function RevealText({
  text,
  as: Tag = "h2",
  className,
  delay = 0,
  italic = [],
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  /** Palabras que van en cursiva (por posición). */
  italic?: number[];
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <motion.span
              className={cn("inline-block", italic.includes(i) && "italic")}
              initial={reduce ? false : { y: "105%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.9, ease: EASE, delay: delay + i * 0.06 }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}

/** Bloque que aparece subiendo y aclarándose al entrar en pantalla. */
export function FadeUp({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Foto que aparece con un fundido suave: sube apenas y pasa de un leve desenfoque a
 * nítida. Espera a estar en pantalla y a haber cargado, para no fundir un hueco vacío;
 * mientras tanto se ve el fondo con la proporción de la foto.
 */
export function FotoSuave({
  src,
  alt,
  className,
  imgClassName,
  delay = 0,
  width,
  height,
  eager,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  delay?: number;
  width?: number;
  height?: number;
  eager?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const enPantalla = useInView(ref, { once: true, margin: "0px 0px -5% 0px" });
  const [cargada, setCargada] = useState(false);
  const lista = reduce || (enPantalla && cargada);
  return (
    <div
      ref={ref}
      className={cn("overflow-hidden bg-card", className)}
      style={{ aspectRatio: width && height ? `${width} / ${height}` : undefined }}
    >
      <motion.img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setCargada(true)}
        className={cn("h-full w-full object-cover", imgClassName)}
        initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(10px)" }}
        animate={lista ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
        transition={{ duration: 0.9, ease: EASE, delay }}
      />
    </div>
  );
}
