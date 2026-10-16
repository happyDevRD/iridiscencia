import { useMemo, useState } from "react";
import { useGaleria, type GalleryPhoto } from "@/lib/gallery";
import { cotizarHref } from "@/lib/contact";
import { Lightbox, type LightboxPhoto } from "@/components/lightbox";
import { Fotograma, Trazo } from "@/components/pelicula";

const PAGE_SIZE = 15;

type Foto = LightboxPhoto & GalleryPhoto;

function Skeleton() {
  return (
    <div className="grid grid-cols-2 gap-y-3 sm:grid-cols-3 lg:grid-cols-5" aria-hidden>
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="pelicula px-1.5">
          <div className="aspect-[4/5] animate-pulse bg-sin-exponer" />
        </div>
      ))}
    </div>
  );
}

export function ProyectosDestacados() {
  const manifest = useGaleria();
  const [categoria, setCategoria] = useState<string>("todo");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [visor, setVisor] = useState<number | null>(null);

  const categorias = useMemo(() => (manifest?.categorias ?? []).filter((c) => c.fotos.length > 0), [manifest]);
  const actual = categorias.find((c) => c.id === categoria);

  const fotos: Foto[] = useMemo(() => {
    const elegidas = actual ? [actual] : categorias;
    return elegidas.flatMap((c) =>
      c.fotos.map((foto, i) => ({
        ...foto,
        caption: c.nombre,
        alt: `${c.nombre}, foto ${i + 1} de ${c.fotos.length} — Iridiscencia`,
      }))
    );
  }, [categorias, actual]);

  const cargando = manifest === undefined;
  const vacio = !cargando && fotos.length === 0;
  const total = categorias.reduce((n, c) => n + c.fotos.length, 0);

  return (
    <section id="trabajo" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="etiqueta text-muted-foreground">Hojas de contacto</p>
            <h2 className="mt-4 text-5xl leading-none sm:text-6xl">El trabajo</h2>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground lg:col-span-5">
            Sesiones reales del estudio, ordenadas por tipo de celebración. Toca una foto para verla completa.
          </p>
        </div>

        {categorias.length > 1 && (
          <div role="group" aria-label="Filtrar por tipo de sesión" className="mt-12 flex flex-wrap gap-x-6 gap-y-3">
            {[{ id: "todo", nombre: "Todo", fotos: { length: total } }, ...categorias].map((c) => {
              const activa = categoria === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={activa}
                  onClick={() => {
                    setCategoria(c.id);
                    setVisible(PAGE_SIZE);
                  }}
                  className="relative flex min-h-11 items-center gap-2 px-1 font-medium text-muted-foreground transition-colors hover:text-foreground aria-pressed:text-foreground"
                >
                  {c.nombre}
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">{c.fotos.length}</span>
                  <Trazo dibujado={activa} className="-inset-x-3 -inset-y-0.5 h-[calc(100%+4px)] w-[calc(100%+24px)]" />
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-10 bg-card p-3 shadow-[0_1px_2px_rgb(0_0_0/0.06),0_24px_48px_-28px_rgb(0_0_0/0.3)] sm:p-6">
          <div className="mb-4 flex items-baseline justify-between gap-4 px-1">
            <p className="etiqueta">{actual?.nombre ?? "Todas las sesiones"}</p>
            {!cargando && !vacio && <p className="etiqueta tabular-nums text-muted-foreground">{fotos.length} fotos</p>}
          </div>

          {cargando && <Skeleton />}

          {vacio && (
            <div className="pelicula px-6 text-center">
              <p className="mx-auto max-w-md py-10 text-lg text-velado">
                Estamos revelando las fotos de las últimas sesiones. Mientras tanto, pídenos ejemplos del tipo de
                evento que te interesa.
              </p>
              <a
                href={cotizarHref("Hola, ¿me pueden enviar ejemplos de su trabajo?")}
                className="mb-6 inline-flex h-11 items-center rounded-sm bg-card px-5 font-medium text-foreground"
              >
                Pedir ejemplos
              </a>
            </div>
          )}

          {fotos.length > 0 && (
            <ul className={`grid grid-cols-2 gap-y-3 sm:grid-cols-3 ${fotos.length < 5 ? "lg:grid-cols-3" : "lg:grid-cols-5"}`}>
              {fotos.slice(0, visible).map((foto, i) => (
                <li key={foto.src} className="pelicula px-1.5">
                  <button
                    type="button"
                    onClick={() => setVisor(i)}
                    aria-label={`Ver ${foto.alt}`}
                    className="group block w-full text-left"
                  >
                    <Fotograma
                      src={foto.thumb}
                      alt=""
                      width={foto.w}
                      height={foto.h}
                      numero={i + 1}
                      retardo={(i % 5) * 90}
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {visible < fotos.length && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="inline-flex h-12 items-center rounded-sm border border-foreground/25 px-6 font-medium transition-colors hover:border-foreground"
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
