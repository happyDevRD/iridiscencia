import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useGaleria } from "@/lib/gallery";
import { intercalar } from "@/lib/fotos";
import { cotizarHref } from "@/lib/contact";
import { Lightbox } from "@/components/lightbox";
import { FadeUp, RevealImage, RevealText } from "@/components/motion";

const PAGE_SIZE = 16;

export function ProyectosDestacados() {
  const manifest = useGaleria();
  const [categoria, setCategoria] = useState<string>("todo");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [visor, setVisor] = useState<number | null>(null);

  const categorias = useMemo(() => (manifest?.categorias ?? []).filter((c) => c.fotos.length > 0), [manifest]);
  const total = useMemo(() => categorias.reduce((n, c) => n + c.fotos.length, 0), [categorias]);

  const fotos = useMemo(() => {
    const elegidas = categoria === "todo" ? categorias : categorias.filter((c) => c.id === categoria);
    const lista = elegidas.flatMap((c) =>
      c.fotos.map((foto, i) => ({
        ...foto,
        categoria: c.id,
        caption: c.nombre,
        alt: `${c.nombre}, foto ${i + 1} de ${c.fotos.length} — Iridiscencia`,
      }))
    );
    // En "Todo" se alternan categorías para que no salgan todas las bodas seguidas
    return categoria === "todo" ? intercalar(lista) : lista;
  }, [categorias, categoria]);

  const cargando = manifest === undefined;
  const vacio = !cargando && fotos.length === 0;

  return (
    <section id="trabajo" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <FadeUp>
              <p className="antetitulo text-muted-foreground">Portafolio</p>
            </FadeUp>
            <RevealText text="Trabajo reciente" italic={[1]} className="mt-4 text-5xl leading-none sm:text-7xl" />
          </div>
          {total > 0 && (
            <FadeUp delay={0.2}>
              <p className="text-muted-foreground">
                {total} fotos de sesiones reales del estudio.
              </p>
            </FadeUp>
          )}
        </div>

        {categorias.length > 1 && (
          // Una sola fila que se desliza en pantallas estrechas, con los bordes difuminados
          <div className="-mx-5 mt-12 overflow-x-auto px-5 [scrollbar-width:none] [mask-image:linear-gradient(90deg,transparent,#000_1.25rem,#000_calc(100%-2.5rem),transparent)] sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden">
            <div role="group" aria-label="Filtrar por tipo de sesión" className="flex w-max gap-1 border-b border-border pr-8">
              {[{ id: "todo", nombre: "Todo", fotos: { length: total } }, ...categorias].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={categoria === c.id}
                  onClick={() => {
                    setCategoria(c.id);
                    setVisible(PAGE_SIZE);
                  }}
                  className="relative flex h-12 items-start gap-1 px-4 pt-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground aria-pressed:text-foreground"
                >
                  {c.nombre}
                  <sup className="pt-1.5 text-[0.65rem] tabular-nums opacity-60">{c.fotos.length}</sup>
                  {categoria === c.id && (
                    <motion.span
                      layoutId="filtro-activo"
                      className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-foreground"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          {cargando && (
            <div className="columns-2 gap-3 lg:columns-3 xl:columns-4" aria-hidden>
              {[4 / 5, 3 / 2, 1, 3 / 2, 4 / 5, 1, 4 / 5, 3 / 2].map((ratio, i) => (
                <div key={i} className="mb-3 animate-pulse rounded-lg bg-card" style={{ aspectRatio: ratio }} />
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="columns-2 gap-3 lg:columns-3 xl:columns-4"
              >
                {fotos.slice(0, visible).map((foto, i) => (
                  <li key={foto.src} className="mb-3 break-inside-avoid">
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
                        delay={(i % 4) * 0.06}
                        eager={i < 4}
                        className="rounded-lg"
                        imgClassName="h-auto transition-transform duration-700 ease-suave group-hover:scale-[1.04]"
                      />
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-2 items-end justify-between bg-gradient-to-t from-black/55 to-transparent p-4 pt-16 text-sm font-medium text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 sm:flex">
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
            <div className="mt-10 flex flex-col items-center gap-4">
              <div className="h-px w-40 overflow-hidden rounded-full bg-border" aria-hidden>
                <div className="h-full bg-foreground transition-[width] duration-500" style={{ width: `${(visible / fotos.length) * 100}%` }} />
              </div>
              <p className="text-sm tabular-nums text-muted-foreground">
                {visible} de {fotos.length}
              </p>
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="h-13 rounded-full border border-foreground/15 px-8 font-medium transition-colors hover:border-foreground"
              >
                Ver más fotos
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
