import { useEffect, useMemo, useState } from "react";
import { fetchGalleryManifest, type GalleryManifest } from "@/lib/gallery";
import { cotizarHref } from "@/lib/contact";
import { Lightbox, type LightboxPhoto } from "@/components/lightbox";

const PAGE_SIZE = 12;

type Foto = LightboxPhoto & { thumb: string };

function Skeleton() {
  return (
    <div className="columns-1 gap-3 sm:columns-2 lg:columns-3" aria-hidden>
      {[4 / 5, 3 / 2, 1, 3 / 2, 4 / 5, 1].map((ratio, i) => (
        <div key={i} className="mb-3 animate-pulse rounded-sm bg-card" style={{ aspectRatio: ratio }} />
      ))}
    </div>
  );
}

export function ProyectosDestacados() {
  const [manifest, setManifest] = useState<GalleryManifest | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [categoria, setCategoria] = useState<string>("todo");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchGalleryManifest().then((data) => {
      setManifest(data);
      setStatus(data ? "ready" : "error");
    });
  }, []);

  const categorias = useMemo(
    () => (manifest?.categorias ?? []).filter((c) => c.fotos.length > 0),
    [manifest]
  );

  const fotos: Foto[] = useMemo(() => {
    const elegidas = categoria === "todo" ? categorias : categorias.filter((c) => c.id === categoria);
    return elegidas.flatMap((c) =>
      c.fotos.map((foto, i) => ({
        ...foto,
        caption: c.nombre,
        alt: `${c.nombre}, foto ${i + 1} de ${c.fotos.length} — Iridiscencia`,
      }))
    );
  }, [categorias, categoria]);

  const empty = status === "error" || (status === "ready" && fotos.length === 0);

  return (
    <section id="trabajo" className="bg-background">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-5xl leading-none sm:text-6xl">Trabajo reciente</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Bodas, XV años, eventos y retratos fotografiados por el estudio.
            </p>
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
                  className="h-10 rounded-full border border-border px-4 text-sm text-muted-foreground transition-colors hover:text-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
                >
                  {c.nombre}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12">
          {status === "loading" && <Skeleton />}

          {empty && (
            <div className="border-t border-border py-16">
              <p className="max-w-md text-lg text-muted-foreground">
                Estamos subiendo las fotos de las últimas sesiones. Mientras tanto, pídenos ejemplos del tipo de
                evento que te interesa.
              </p>
              <a href={cotizarHref("Hola, ¿me pueden enviar ejemplos de su trabajo?")} className="mt-6 inline-block underline underline-offset-4">
                Pedir ejemplos
              </a>
            </div>
          )}

          {status === "ready" && fotos.length > 0 && (
            <>
              <ul className="columns-1 gap-3 sm:columns-2 lg:columns-3">
                {fotos.slice(0, visible).map((foto, i) => (
                  <li key={foto.src} className="mb-3 break-inside-avoid">
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(i)}
                      className="group block w-full overflow-hidden rounded-sm bg-card"
                    >
                      <img
                        src={foto.thumb}
                        alt={foto.alt}
                        loading={i < 3 ? "eager" : "lazy"}
                        decoding="async"
                        className="w-full transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </button>
                  </li>
                ))}
              </ul>

              {visible < fotos.length && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    className="h-12 rounded-full border border-border px-6 text-sm font-medium transition-colors hover:border-foreground"
                  >
                    Ver más fotos ({fotos.length - visible})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {lightboxIndex !== null && fotos[lightboxIndex] && (
        <Lightbox
          photos={fotos}
          index={lightboxIndex}
          onChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  );
}
