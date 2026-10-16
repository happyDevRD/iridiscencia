import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import paquetesData from "@/content/paquetes.json";
import { type Catalogo, type CatalogoProducto, fetchCatalogo, formatoPrecio, productosPorPrefijo } from "@/lib/catalogo";
import { COTIZAR_EVENT, whatsappUrl } from "@/lib/contact";
import { useGaleria, type GalleryManifest } from "@/lib/gallery";
import { FadeUp, RevealText } from "@/components/motion";
import { conRelleno, fotosDeGaleria } from "@/lib/fotos";

const EASE = [0.22, 1, 0.36, 1] as const;

type Paquete = (typeof paquetesData.paquetes)[number];

/** Foto de la carpeta del NAS de esa sesión; si no hay, la del CMS; si tampoco, otra de la galería. */
function imagenDe(paquete: Paquete, galeria: GalleryManifest | null | undefined, otra?: string): string {
  const categoria = galeria?.categorias.find((c) => c.id === paquete.galeria);
  return categoria?.fotos[0]?.src || paquete.imagen || otra || "";
}

function precioDe(paquete: Paquete, combos: CatalogoProducto[], catalogo: Catalogo | null) {
  if (combos.length > 0) return `Desde ${formatoPrecio(combos[0].precio)}${catalogo?.preciosIncluyenItbis ? " · ITBIS incluido" : ""}`;
  const p = paquete.precioDesde.trim();
  return !p || /consultar/i.test(p) ? "Precio según la cobertura" : `Desde ${p}`;
}

function Cotizar({ paquete, claro }: { paquete: Paquete; claro?: boolean }) {
  const wa = whatsappUrl(`Hola, quiero cotizar una sesión de ${paquete.nombre}.`);
  return (
    <a
      href={wa ?? "#contacto"}
      target={wa ? "_blank" : undefined}
      rel={wa ? "noopener" : undefined}
      onClick={() => {
        if (!wa) window.dispatchEvent(new CustomEvent(COTIZAR_EVENT, { detail: [paquete.nombre] }));
      }}
      className={`group inline-flex h-12 items-center gap-2 rounded-full pl-6 pr-4 text-sm font-medium transition-colors ${
        claro ? "bg-white text-foreground hover:bg-white/85" : "bg-foreground text-background hover:bg-foreground/85"
      }`}
    >
      Cotizar {paquete.nombre}
      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
    </a>
  );
}

function Combos({ combos }: { combos: CatalogoProducto[] }) {
  if (combos.length === 0) return null;
  return (
    <ul className="mt-5 space-y-2 text-sm">
      {combos.slice(0, 3).map((c) => (
        <li key={c.sku} className="flex items-baseline justify-between gap-4 border-b border-white/20 pb-2">
          <span className="min-w-0 truncate">{c.nombre}</span>
          <span className="shrink-0 tabular-nums">{formatoPrecio(c.precio)}</span>
        </li>
      ))}
    </ul>
  );
}

export function Paquetes() {
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null);
  const [activo, setActivo] = useState(0);
  const galeria = useGaleria();

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
    return paquetesData.paquetes.map((p, i) => {
      const combos = productosPorPrefijo(catalogo, p.prefijosSku ?? []);
      return { paquete: p, combos, imagen: imagenDe(p, galeria, otras[i]?.src), precio: precioDe(p, combos, catalogo) };
    });
  }, [catalogo, galeria]);

  return (
    <section id="sesiones" className="bg-card py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <FadeUp>
              <p className="antetitulo text-muted-foreground">Sesiones y precios</p>
            </FadeUp>
            <RevealText text="Elige tu sesión" italic={[2]} className="mt-4 text-5xl leading-none sm:text-7xl" />
          </div>
          <FadeUp delay={0.15} className="max-w-sm">
            <p className="text-lg leading-relaxed text-muted-foreground">
              Cada cobertura se arma según tu evento: horas, lugares y lo que quieras recibir.
            </p>
          </FadeUp>
        </div>

        {/* Escritorio: paneles que se expanden al pasar el ratón */}
        <FadeUp delay={0.1} className="mt-14 hidden h-[600px] gap-2 lg:flex">
          {paquetes.map(({ paquete, combos, imagen, precio }, i) => {
            const abierto = i === activo;
            return (
              <motion.div
                key={paquete.id}
                layout
                onMouseEnter={() => setActivo(i)}
                onFocus={() => setActivo(i)}
                transition={{ duration: 0.7, ease: EASE }}
                className="relative cursor-pointer overflow-hidden rounded-xl bg-foreground text-white"
                style={{ flex: abierto ? 6 : 1 }}
              >
                {imagen && (
                  <motion.img
                    src={imagen}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                    animate={{ scale: abierto ? 1 : 1.15 }}
                    transition={{ duration: 1, ease: EASE }}
                  />
                )}
                <div
                  className={`absolute inset-0 transition-colors duration-700 ${abierto ? "bg-gradient-to-t from-black/80 via-black/20 to-transparent" : "bg-black/45"}`}
                />

                {/* Cerrado: nombre en vertical */}
                <AnimatePresence>
                  {!abierto && (
                    <motion.button
                      type="button"
                      onClick={() => setActivo(i)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-end justify-center pb-8"
                      aria-label={`Ver ${paquete.nombre}`}
                    >
                      <span className="whitespace-nowrap font-display text-2xl [writing-mode:vertical-rl] rotate-180">
                        {paquete.nombre}
                      </span>
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Abierto: detalle */}
                <AnimatePresence>
                  {abierto && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.6, ease: EASE } }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                      className="absolute inset-x-0 bottom-0 max-w-xl p-8"
                    >
                      <p className="antetitulo text-white/75">{precio}</p>
                      <h3 className="mt-3 text-5xl leading-none">{paquete.nombre}</h3>
                      <p className="mt-4 max-w-md leading-relaxed text-white/85">{paquete.descripcion}</p>
                      <Combos combos={combos} />
                      <div className="mt-6">
                        <Cotizar paquete={paquete} claro />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </FadeUp>

        {/* Móvil y tableta: carrusel de tarjetas */}
        <ul className="-mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:hidden">
          {paquetes.map(({ paquete, combos, imagen, precio }) => (
            <li key={paquete.id} className="relative h-[520px] w-[82vw] max-w-sm shrink-0 snap-center overflow-hidden rounded-xl bg-foreground text-white">
              {imagen && <img src={imagen} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="antetitulo text-white/75">{precio}</p>
                <h3 className="mt-2 text-4xl leading-none">{paquete.nombre}</h3>
                <p className="mt-3 leading-relaxed text-white/85">{paquete.descripcion}</p>
                <Combos combos={combos} />
                <div className="mt-5">
                  <Cotizar paquete={paquete} claro />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
