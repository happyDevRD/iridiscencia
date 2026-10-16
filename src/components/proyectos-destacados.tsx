import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useGaleria } from "@/lib/gallery";
import { cotizarHref } from "@/lib/contact";
import { Lightbox } from "@/components/lightbox";
import { FadeUp, RevealImage, RevealText } from "@/components/motion";

const PAGE_SIZE = 12;

export function ProyectosDestacados() {
  const manifest = useGaleria();
  const [categoria, setCategoria] = useState<string>("todo");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [visor, setVisor] = useState<number | null>(null);

  const categorias = useMemo(() => (manifest?.categorias ?? []).filter((c) => c.fotos.length > 0), [manifest]);

  const fotos = useMemo(() => {
    const elegidas = categoria === "todo" ? categorias : categorias.filter((c) => c.id === categoria);
    return elegidas.flatMap((c) =>
      c.fotos.map((foto, i) => ({
        ...foto,
        caption: c.nombre,
        alt: `${c.nombre}, foto ${i + 1} de ${c.fotos.length} — Iridiscencia`,
      }))
    );
  }, [categorias, categoria]);

  const cargando = manifest === undefined;
  const vacio = !cargando && fotos.length === 0;

  return (
    <section id="trabajo" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <FadeUp>
              <p className="antetitulo text-muted-foreground">Portafolio</p>
            </FadeUp>
            <RevealText text="Trabajo reciente" italic={[1]} className="mt-4 text-5xl leading-none sm:text-7xl" />
          </div>

          {categorias.length > 1 && (
            <div role="group" aria-label="Filtrar por tipo de sesión" className="flex flex-wrap gap-2">
              {[{ id: "todo", nombre: "Todo" }, ...categorias].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={categoria === c.id}
                  onClick={() => {
                    setCategoria(c.id);
                    setVisible(PAGE_SIZE);
                  }}
                  className="relative h-11 rounded-full px-5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-pressed:text-background"
                >
                  {categoria === c.id && (
                    <motion.span
                      layoutId="filtro-activo"
                      className="absolute inset-0 rounded-full bg-foreground"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{c.nombre}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-14">
          {cargando && (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3" aria-hidden>
              {[4 / 5, 3 / 2, 1, 3 / 2, 4 / 5, 1].map((ratio, i) => (
                <div key={i} className="mb-4 animate-pulse rounded-lg bg-card" style={{ aspectRatio: ratio }} />
              ))}
            </div>
          )}

          {vacio && (
            <div className="rounded-xl bg-card px-6 py-16 text-center">
              <p className="mx-auto max-w-md text-lg text-muted-foreground">
                Estamos subiendo las fotos de las últimas sesiones. Mientras tanto, pídenos ejemplos del tipo de evento
                que te interesa.
              </p>
              <a href={cotizarHref("Hola, ¿me pueden enviar ejemplos de su trabajo?")} className="mt-6 inline-block font-medium underline underline-offset-4">
                Pedir ejemplos
              </a>
            </div>
          )}

          {fotos.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.ul
                key={categoria}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="columns-1 gap-4 sm:columns-2 lg:columns-3"
              >
                {fotos.slice(0, visible).map((foto, i) => (
                  <li key={foto.src} className="mb-4 break-inside-avoid">
                    <button
                      type="button"
                      onClick={() => setVisor(i)}
                      aria-label={`Ver ${foto.alt}`}
                      className="group relative block w-full overflow-hidden rounded-lg"
                    >
                      <RevealImage
                        src={foto.thumb}
                        alt=""
                        width={foto.w}
                        height={foto.h}
                        delay={(i % 3) * 0.08}
                        eager={i < 3}
                        className="rounded-lg"
                        imgClassName="h-auto transition-transform duration-700 ease-suave group-hover:scale-[1.04]"
                      />
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between bg-gradient-to-t from-black/55 to-transparent p-5 pt-16 text-sm font-medium text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        {foto.caption}
                        <span className="antetitulo text-white/80">Ver</span>
                      </span>
                    </button>
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          )}

          {visible < fotos.length && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="h-13 rounded-full border border-foreground/15 px-8 font-medium transition-colors hover:border-foreground"
              >
                Ver más fotos ({fotos.length - visible})
              </button>
            </div>
          )}
        </div>
      </div>

      {visor !== null && fotos[visor] && (
        <Lightbox photos={fotos} index={visor} onChange={setVisor} onClose={() => setVisor(null)} />
      )}
    </section>
  );
}
