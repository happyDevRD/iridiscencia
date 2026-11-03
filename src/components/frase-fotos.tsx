import { Fragment, useLayoutEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useGaleria } from "@/lib/gallery";
import { conRelleno, fotosDeGaleria, intercalar, type Foto } from "@/lib/fotos";

/**
 * Frase grande que se escribe al bajar, con fotos pequeñas entre las palabras; después
 * la foto del centro se abre desde su hueco hasta ocupar toda la pantalla.
 * "#" marca dónde va una foto y "@" la que se abre.
 */
const LINEAS = [
  ["Cada", "#", "historia"],
  ["merece", "ser", "@", "contada"],
  ["en", "#", "grande."],
];

const FIN_TEXTO = 0.42; // la frase termina de escribirse
const ABRE = [0.5, 0.82] as const; // la foto central se abre

type Token = { tipo: "palabra"; texto: string } | { tipo: "foto"; centro: boolean };

const TOKENS: Token[][] = LINEAS.map((l) =>
  l.map((t): Token => (t === "#" || t === "@" ? { tipo: "foto", centro: t === "@" } : { tipo: "palabra", texto: t }))
);
const TOTAL = TOKENS.flat().length;

/**
 * Como `useTransform(p, [a, b], [x, y])` pero calculado en JS: con el rango en array,
 * motion acelera la opacidad con la línea de tiempo nativa y queda desfasada del scroll.
 */
function useRango(p: MotionValue<number>, a: number, b: number, x: number, y: number) {
  return useTransform(p, (v) => {
    const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
    return x + (y - x) * t;
  });
}

export function FraseFotos() {
  const manifest = useGaleria();
  const fotos = useMemo(() => {
    if (manifest === undefined) return [];
    const todas = fotosDeGaleria(manifest);
    const portada = todas.filter((f) => f.categoria === "Portada");
    const resto = intercalar(todas.filter((f) => f.categoria !== "Portada"));
    // La que se abre, mejor de la portada (horizontal y de calidad); las pequeñas, variadas.
    return conRelleno([...(portada.length ? [portada[1] ?? portada[0]] : []), ...resto], 3);
  }, [manifest]);
  const reduce = useReducedMotion();

  if (fotos.length < 3) return null;
  return reduce ? <Estatica fotos={fotos} /> : <Escena fotos={fotos} />;
}

/** Orden en que salen las fotos: la central es la primera de la lista. */
function fotoPara(fotos: Foto[], centro: boolean, contador: { n: number }) {
  if (centro) return fotos[0];
  contador.n += 1;
  return fotos[contador.n];
}

function Estatica({ fotos }: { fotos: Foto[] }) {
  const contador = { n: 0 };
  return (
    <section aria-label="Fotos destacadas" className="mx-auto max-w-6xl px-5 py-24 text-center sm:px-8">
      <p className="font-display text-5xl leading-[1.1] sm:text-7xl lg:text-8xl">
        {TOKENS.map((linea, l) => (
          <span key={l} className="block">
            {linea.map((t, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                {t.tipo === "palabra" ? (
                  t.texto
                ) : (
                  <Pastilla foto={fotoPara(fotos, t.centro, contador)} centro={t.centro} />
                )}
              </Fragment>
            ))}
          </span>
        ))}
      </p>
    </section>
  );
}

function Pastilla({ foto, centro, children }: { foto: Foto; centro: boolean; children?: React.ReactNode }) {
  return (
    <span
      className={`relative inline-block h-[0.78em] overflow-hidden rounded-full align-[-0.08em] ${centro ? "w-[2.1em]" : "w-[1.45em]"}`}
    >
      {children ?? <img src={foto.thumb} alt="" className="h-full w-full object-cover" />}
    </span>
  );
}

function Palabra({ texto, i, progress }: { texto: string; i: number; progress: MotionValue<number> }) {
  const desde = (i / TOTAL) * FIN_TEXTO;
  const hasta = ((i + 1) / TOTAL) * FIN_TEXTO;
  const opacity = useRango(progress, desde, hasta, 0.12, 1);
  return <motion.span style={{ opacity }}>{texto}</motion.span>;
}

function FotoChica({ foto, i, progress }: { foto: Foto; i: number; progress: MotionValue<number> }) {
  const desde = (i / TOTAL) * FIN_TEXTO;
  const hasta = ((i + 1.4) / TOTAL) * FIN_TEXTO;
  const scale = useRango(progress, desde, hasta, 0, 1);
  const rotate = useRango(progress, desde, hasta, -12, 0);
  return (
    <Pastilla foto={foto} centro={false}>
      <motion.img style={{ scale, rotate }} src={foto.thumb} alt="" className="h-full w-full object-cover" />
    </Pastilla>
  );
}

function Escena({ fotos }: { fotos: Foto[] }) {
  const ref = useRef<HTMLElement>(null);
  const escenario = useRef<HTMLDivElement>(null);
  const hueco = useRef<HTMLSpanElement>(null);
  // Hueco de la foto central, en px dentro del escenario (pantalla completa).
  const caja = useRef({ top: 0, right: 0, bottom: 0, left: 0, radio: 999 });

  useLayoutEffect(() => {
    const medir = () => {
      const e = escenario.current?.getBoundingClientRect();
      const h = hueco.current?.getBoundingClientRect();
      if (!e || !h) return;
      caja.current = {
        top: h.top - e.top,
        left: h.left - e.left,
        right: e.right - h.right,
        bottom: e.bottom - h.bottom,
        radio: h.height / 2,
      };
    };
    medir();
    const ro = new ResizeObserver(medir);
    if (escenario.current) ro.observe(escenario.current);
    if (hueco.current) ro.observe(hueco.current);
    document.fonts?.ready.then(medir);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Antes de abrirse, la foto grande ocupa justo el hueco de la frase.
  const clipPath = useTransform(p, (v) => {
    const t = Math.min(1, Math.max(0, (v - ABRE[0]) / (ABRE[1] - ABRE[0])));
    const e = 1 - Math.pow(1 - t, 3); // sale rápido y frena al llegar
    const c = caja.current;
    const k = 1 - e;
    return `inset(${c.top * k}px ${c.right * k}px ${c.bottom * k}px ${c.left * k}px round ${Math.max(c.radio * k, 0)}px)`;
  });
  const fotoVisible = useRango(p, FIN_TEXTO - 0.06, FIN_TEXTO, 0, 1);
  const fotoScale = useRango(p, ABRE[0], 1, 1.35, 1);
  const textoOpacity = useRango(p, ABRE[0] + 0.1, ABRE[0] + 0.22, 1, 0);
  const pieOpacity = useRango(p, 0.84, 0.94, 0, 1);
  const pieY = useRango(p, 0.84, 0.94, 30, 0);
  const pistaOpacity = useRango(p, 0, 0.06, 1, 0);

  const contador = { n: 0 };
  let indice = 0;

  return (
    <section ref={ref} aria-label="Fotos destacadas" data-parada="inicio fin" className="relative h-[320vh]">
      <div ref={escenario} className="sticky top-0 flex h-svh items-center justify-center overflow-hidden">
        <motion.p
          style={{ opacity: textoOpacity }}
          className="px-5 text-center font-display text-[min(8vw,8rem)] leading-[1.1] tracking-tight"
        >
          {TOKENS.map((linea, l) => (
            <span key={l} className="block whitespace-nowrap">
              {linea.map((t, i) => {
                const n = indice++;
                return (
                  <Fragment key={i}>
                    {i > 0 && " "}
                    {t.tipo === "palabra" ? (
                      <Palabra texto={t.texto} i={n} progress={p} />
                    ) : t.centro ? (
                      // Solo el hueco: la foto que se ve encima es la capa grande.
                      <span ref={hueco} className="inline-block h-[0.78em] w-[2.1em] align-[-0.08em]" />
                    ) : (
                      <FotoChica foto={fotoPara(fotos, false, contador)} i={n} progress={p} />
                    )}
                  </Fragment>
                );
              })}
            </span>
          ))}
        </motion.p>

        <motion.div style={{ clipPath, opacity: fotoVisible }} className="absolute inset-0">
          <motion.img
            style={{ scale: fotoScale }}
            src={fotos[0].src}
            alt={fotos[0].alt}
            decoding="async"
            className="h-full w-full object-cover"
          />
          <motion.div
            style={{ opacity: pieOpacity, y: pieY }}
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-5 pb-12 pt-40 text-center text-white sm:pb-16"
          >
            <p className="antetitulo text-white/80">Iridiscencia Film</p>
            <p className="mt-3 font-display text-4xl sm:text-6xl">
              Momentos que se <span className="italic">quedan</span>
            </p>
          </motion.div>
        </motion.div>

        <motion.p
          style={{ opacity: pistaOpacity }}
          className="antetitulo pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground"
        >
          Sigue bajando
        </motion.p>
      </div>
    </section>
  );
}
