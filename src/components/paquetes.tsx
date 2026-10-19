import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, type MotionValue, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { ArrowUpRight, Images } from "lucide-react";
import paquetesData from "@/content/paquetes.json";
import { type Catalogo, type CatalogoProducto, fetchCatalogo, formatoPrecio, productosPorPrefijo } from "@/lib/catalogo";
import { COTIZAR_EVENT, whatsappUrl } from "@/lib/contact";
import { useGaleria, type GalleryManifest } from "@/lib/gallery";
import { FadeUp, RevealText } from "@/components/motion";
import { Lightbox, type LightboxPhoto } from "@/components/lightbox";
import { conRelleno, fotosDeGaleria } from "@/lib/fotos";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
/** Fotos que pasan en el panel abierto, y cada cuánto cambian. */
const FOTOS_PASE = 5;
const INTERVALO = 5000;

type Paquete = (typeof paquetesData.paquetes)[number];

/**
 * Fotos de la carpeta del NAS de esa sesión, empezando en la `inicio`-ésima para que dos
 * sesiones que comparten carpeta no abran con la misma; si no hay, la del CMS o otra de la galería.
 */
function fotosDe(paquete: Paquete, galeria: GalleryManifest | null | undefined, inicio: number, otra?: string): LightboxPhoto[] {
  const fotos = galeria?.categorias.find((c) => c.id === paquete.galeria)?.fotos ?? [];
  if (fotos.length === 0) {
    const src = paquete.imagen || otra;
    return src ? [{ src, alt: paquete.nombre, caption: paquete.nombre }] : [];
  }
  const desde = inicio % fotos.length;
  return [...fotos.slice(desde), ...fotos.slice(0, desde)].map((f, i) => ({
    src: f.src,
    thumb: f.thumb,
    alt: `${paquete.nombre}, foto ${i + 1} — Iridiscencia`,
    caption: paquete.nombre,
  }));
}

function precioDe(paquete: Paquete, combos: CatalogoProducto[], catalogo: Catalogo | null) {
  if (combos.length > 0) return `Desde ${formatoPrecio(combos[0].precio)}${catalogo?.preciosIncluyenItbis ? " · ITBIS incluido" : ""}`;
  const p = paquete.precioDesde.trim();
  return !p || /consultar/i.test(p) ? "Precio según la cobertura" : `Desde ${p}`;
}

function Cotizar({ paquete }: { paquete: Paquete }) {
  const wa = whatsappUrl(`Hola, quiero cotizar una sesión de ${paquete.nombre}.`);
  return (
    <a
      href={wa ?? "#contacto"}
      target={wa ? "_blank" : undefined}
      rel={wa ? "noopener" : undefined}
      onClick={() => {
        if (!wa) window.dispatchEvent(new CustomEvent(COTIZAR_EVENT, { detail: [paquete.nombre] }));
      }}
      className="group inline-flex h-12 items-center gap-2 rounded-full bg-white pl-6 pr-4 text-sm font-medium text-tinta transition-colors hover:bg-white/85"
    >
      Cotizar {paquete.nombre}
      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
    </a>
  );
}

function VerFotos({ n, onClick }: { n: number; onClick: () => void }) {
  if (n < 2) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-12 items-center gap-2 rounded-full border border-white/35 px-5 text-sm font-medium transition-colors hover:bg-white/10"
    >
      <Images className="size-4" aria-hidden />
      Ver {n} fotos
    </button>
  );
}

function Combos({ combos }: { combos: CatalogoProducto[] }) {
  if (combos.length === 0) return null;
  // En pantallas bajas no caben: queda el precio «Desde»
  return (
    <ul className="mt-5 hidden space-y-2 text-sm [@media(min-height:760px)]:block">
      {combos.slice(0, 3).map((c) => (
        <li key={c.sku} className="flex items-baseline justify-between gap-4 border-b border-white/20 pb-2">
          <span className="min-w-0 truncate">{c.nombre}</span>
          <span className="shrink-0 tabular-nums">{formatoPrecio(c.precio)}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Fotos del panel: abierto, pasan solas con un fundido y un zoom lento hacia atrás;
 * cerrado, se queda la primera un poco ampliada.
 */
function Pase({ fotos, abierto }: { fotos: LightboxPhoto[]; abierto: boolean }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  const pase = fotos.slice(0, FOTOS_PASE);
  const anima = abierto && !reduce && pase.length > 1;

  useEffect(() => {
    if (!anima) return;
    const id = window.setInterval(() => setN((v) => (v + 1) % pase.length), INTERVALO);
    return () => window.clearInterval(id);
  }, [anima, pase.length]);

  const foto = pase[abierto ? n % Math.max(1, pase.length) : 0];
  if (!foto) return null;

  return (
    <>
      <AnimatePresence initial={false}>
        <motion.img
          key={foto.src}
          src={foto.src}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: abierto && !reduce ? 1 : 1.15 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.2 }, scale: { duration: abierto ? INTERVALO / 1000 + 1.5 : 1, ease: abierto ? "linear" : EASE } }}
        />
      </AnimatePresence>
      {anima && (
        // Barras de progreso del pase
        <div className="absolute inset-x-8 top-8 z-10 flex gap-1.5" aria-hidden>
          {pase.map((f, i) => (
            <span key={f.src} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/25">
              {i <= n % pase.length && (
                <motion.span
                  key={i === n % pase.length ? `activa-${n}` : "llena"}
                  className="block h-full origin-left bg-white"
                  initial={{ scaleX: i === n % pase.length ? 0 : 1 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: i === n % pase.length ? INTERVALO / 1000 : 0, ease: "linear" }}
                />
              )}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

/** Círculo «Ver fotos» que sigue al ratón sobre el panel abierto. */
function CursorVer({ x, y, visible }: { x: MotionValue<number>; y: MotionValue<number>; visible: boolean }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-20 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-xs font-medium tracking-wide text-tinta backdrop-blur"
      style={{ x, y }}
      initial={false}
      animate={{ scale: visible ? 1 : 0, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      Ver fotos
    </motion.div>
  );
}

export function Paquetes() {
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null);
  const [activo, setActivo] = useState(0);
  const [visor, setVisor] = useState<{ fotos: LightboxPhoto[]; i: number } | null>(null);
  const [cursor, setCursor] = useState(false);
  const galeria = useGaleria();
  const reduce = useReducedMotion();
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);
  const sx = useSpring(cx, { stiffness: 300, damping: 30 });
  const sy = useSpring(cy, { stiffness: 300, damping: 30 });

  // Los combos y precios salen de ProStock; si el catálogo no carga se usa el texto del CMS.
  useEffect(() => {
    let vivo = true;
    fetchCatalogo().then((c) => {
      if (vivo) setCatalogo(c);
    });
    return () => {
      vivo = false;
    };
  }, []);

  const paquetes = useMemo(() => {
    const otras = conRelleno(fotosDeGaleria(galeria), paquetesData.paquetes.length);
    const usadas: Record<string, number> = {};
    return paquetesData.paquetes.map((p, i) => {
      const combos = productosPorPrefijo(catalogo, p.prefijosSku ?? []);
      const n = (usadas[p.galeria] = (usadas[p.galeria] ?? -1) + 1);
      return { paquete: p, combos, fotos: fotosDe(p, galeria, n * FOTOS_PASE, otras[i]?.src), precio: precioDe(p, combos, catalogo) };
    });
  }, [catalogo, galeria]);

  const total = String(paquetes.length).padStart(2, "0");

  // Ocupa justo una pantalla y es una parada fuerte del scroll: se ve siempre entera
  return (
    <section
      id="sesiones"
      data-parada="inicio"
      data-parada-fuerte
      className="flex h-svh min-h-[600px] flex-col bg-tinta pb-5 pt-20 text-white sm:pt-24 lg:pb-3"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <FadeUp>
              <p className="antetitulo text-white/55">Sesiones y precios</p>
            </FadeUp>
            <RevealText text="Elige tu sesión" italic={[2]} className="mt-3 text-4xl leading-none sm:text-6xl" />
          </div>
          <FadeUp delay={0.15} className="hidden max-w-sm sm:block">
            <p className="leading-relaxed text-white/65">
              Cada cobertura se arma según tu evento: horas, lugares y lo que quieras recibir.
            </p>
          </FadeUp>
        </div>
      </div>

      {/* Escritorio: paneles de borde a borde que se expanden al pasar el ratón */}
      <FadeUp delay={0.1} className="mx-auto mt-8 hidden min-h-0 w-full max-w-[1920px] flex-1 gap-2 px-3 lg:flex">
        {paquetes.map(({ paquete, combos, fotos, precio }, i) => {
          const abierto = i === activo;
          const numero = String(i + 1).padStart(2, "0");
          return (
            <motion.div
              key={paquete.id}
              layout
              onMouseEnter={() => setActivo(i)}
              onFocus={() => setActivo(i)}
              onPointerMove={(e) => {
                if (!abierto) return;
                const r = e.currentTarget.getBoundingClientRect();
                cx.set(e.clientX - r.left);
                cy.set(e.clientY - r.top);
                // Sobre el texto y los botones vuelve el cursor normal
                setCursor(!reduce && !(e.target as Element).closest("[data-texto]"));
              }}
              onPointerLeave={() => setCursor(false)}
              onClick={() => abierto && fotos.length > 1 && setVisor({ fotos, i: 0 })}
              transition={{ duration: 0.7, ease: EASE }}
              className={cn(
                "relative overflow-hidden rounded-2xl bg-white/5",
                abierto && fotos.length > 1 && !reduce ? "cursor-none" : "cursor-pointer"
              )}
              style={{ flex: abierto ? 7 : 1 }}
            >
              <Pase fotos={fotos} abierto={abierto} />
              <div
                className={`absolute inset-0 transition-colors duration-700 ${
                  abierto ? "bg-gradient-to-t from-black/85 via-black/15 to-black/30" : "bg-black/50 hover:bg-black/35"
                }`}
              />
              {/* Sombra a la izquierda para leer el texto sobre fotos claras */}
              <div
                className={`absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-black/55 to-transparent transition-opacity duration-700 ${
                  abierto ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Cerrado: número arriba y nombre en vertical */}
              <AnimatePresence>
                {!abierto && (
                  <motion.button
                    type="button"
                    onClick={() => setActivo(i)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-between py-8"
                    aria-label={`Ver ${paquete.nombre}`}
                  >
                    <span className="text-xs tabular-nums text-white/60">{numero}</span>
                    <span className="whitespace-nowrap font-display text-2xl [writing-mode:vertical-rl] rotate-180">
                      {paquete.nombre}
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Abierto: detalle (los botones no abren el visor por clic en el panel) */}
              <AnimatePresence>
                {abierto && (
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.6, ease: EASE } }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    onClick={(e) => e.stopPropagation()}
                    data-texto
                    className="absolute bottom-0 left-0 max-w-xl cursor-auto p-8 xl:p-10"
                  >
                    <p className="text-sm tabular-nums text-white/60">
                      {numero} <span className="text-white/35">/ {total}</span>
                    </p>
                    <h3 className="mt-3 text-5xl leading-none xl:text-6xl">{paquete.nombre}</h3>
                    <p className="antetitulo mt-5 text-white/75">{precio}</p>
                    <p className="mt-4 max-w-md leading-relaxed text-white/85">{paquete.descripcion}</p>
                    <Combos combos={combos} />
                    <div className="mt-7 flex flex-wrap gap-3">
                      <Cotizar paquete={paquete} />
                      <VerFotos n={fotos.length} onClick={() => setVisor({ fotos, i: 0 })} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {abierto && fotos.length > 1 && <CursorVer x={sx} y={sy} visible={cursor} />}
            </motion.div>
          );
        })}
      </FadeUp>

      {/* Móvil y tableta: carrusel de tarjetas */}
      <ul className="mt-6 flex min-h-0 flex-1 snap-x snap-mandatory gap-3 overflow-x-auto px-5 [scrollbar-width:none] sm:px-8 lg:hidden">
        {paquetes.map(({ paquete, combos, fotos, precio }, i) => (
          <li
            key={paquete.id}
            className="relative h-full w-[85vw] max-w-sm shrink-0 snap-center overflow-hidden rounded-2xl bg-white/5"
          >
            <Pase fotos={fotos} abierto={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 from-15% via-black/55 via-55% to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="text-sm tabular-nums text-white/60">
                {String(i + 1).padStart(2, "0")} <span className="text-white/35">/ {total}</span>
              </p>
              <h3 className="mt-2 text-4xl leading-none">{paquete.nombre}</h3>
              <p className="antetitulo mt-3 text-white/75">{precio}</p>
              <p className="mt-3 leading-relaxed text-white/85">{paquete.descripcion}</p>
              <Combos combos={combos} />
              <div className="mt-5 flex flex-wrap gap-2">
                <Cotizar paquete={paquete} />
                <VerFotos n={fotos.length} onClick={() => setVisor({ fotos, i: 0 })} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {visor && (
        <Lightbox photos={visor.fotos} index={visor.i} onChange={(i) => setVisor({ ...visor, i })} onClose={() => setVisor(null)} />
      )}
    </section>
  );
}
