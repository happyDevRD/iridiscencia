import { useEffect, useState } from "react";
import paquetesData from "@/content/paquetes.json";
import { type Catalogo, fetchCatalogo, formatoPrecio, productosPorPrefijo } from "@/lib/catalogo";
import { COTIZAR_EVENT, whatsappUrl } from "@/lib/contact";
import { fetchGalleryManifest, type GalleryManifest } from "@/lib/gallery";

/** Primera foto de la carpeta del NAS que corresponde al paquete; si no hay, la del CMS. */
function imagenDe(paquete: { galeria?: string; imagen?: string }, galeria: GalleryManifest | null): string {
  const categoria = galeria?.categorias.find((c) => c.id === paquete.galeria);
  return categoria?.fotos[0]?.thumb ?? paquete.imagen ?? "";
}

/** Sin foto, un mosaico tipográfico en vez de un hueco gris. */
function Mosaico({ numero }: { numero: number }) {
  return (
    <div aria-hidden className="paquete-mosaico flex h-full w-full items-end p-5">
      <span className="font-display text-7xl leading-none text-foreground/90 tabular-nums">
        {String(numero).padStart(2, "0")}
      </span>
    </div>
  );
}

function precio(precioDesde: string) {
  const p = precioDesde.trim();
  return !p || /consultar/i.test(p) ? "Precio según la cobertura" : `Desde ${p}`;
}

export function Paquetes() {
  // Los combos y precios salen de ProStock; si el catálogo no carga, cada
  // paquete se muestra igual que antes, con el texto del CMS.
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null);
  const [galeria, setGaleria] = useState<GalleryManifest | null>(null);
  useEffect(() => {
    let vivo = true;
    fetchCatalogo().then((c) => {
      if (vivo) setCatalogo(c);
    });
    fetchGalleryManifest().then((g) => {
      if (vivo) setGaleria(g);
    });
    return () => {
      vivo = false;
    };
  }, []);

  return (
    <section id="paquetes" className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="max-w-xl">
          <h2 className="text-5xl leading-none sm:text-6xl">Paquetes</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Cada cobertura se arma según tu evento: horas, lugares y entregables. Elige un tipo y te enviamos la
            cotización.
          </p>
        </div>

        <ul className="mt-14 divide-y divide-border border-y border-border">
          {paquetesData.paquetes.map((paquete, i) => {
            const imagen = imagenDe(paquete, galeria);
            const combos = productosPorPrefijo(catalogo, paquete.prefijosSku ?? []);
            const wa = whatsappUrl(`Hola, quiero cotizar el paquete de ${paquete.nombre}.`);
            return (
              <li key={paquete.id} className="grid gap-6 py-8 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                <div className="aspect-[3/2] overflow-hidden rounded-sm bg-card">
                  {imagen ? (
                    <img src={imagen} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  ) : (
                    <Mosaico numero={i + 1} />
                  )}
                </div>
                <div className="flex flex-col justify-between gap-6">
                  <div>
                    <h3 className="text-4xl leading-tight">{paquete.nombre}</h3>
                    <p className="mt-3 max-w-prose leading-relaxed text-muted-foreground">{paquete.descripcion}</p>
                    {combos.length > 0 && (
                      <ul className="mt-6 divide-y divide-border border-t border-border">
                        {combos.map((combo) => (
                          <li key={combo.sku} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                            <div className="min-w-0">
                              <p className="font-medium">{combo.nombre}</p>
                              {combo.incluye.length > 0 && (
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{combo.incluye.join(" · ")}</p>
                              )}
                            </div>
                            <p className="shrink-0 text-sm tabular-nums">
                              {combo.enPromocion && (
                                <span className="mr-2 text-muted-foreground line-through">{formatoPrecio(combo.precioRegular)}</span>
                              )}
                              {formatoPrecio(combo.precio)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                      {combos.length > 0
                        ? `Desde ${formatoPrecio(combos[0].precio)}${catalogo?.preciosIncluyenItbis ? " · ITBIS incluido" : ""}`
                        : precio(paquete.precioDesde)}
                    </p>
                    <a
                      href={wa ?? "#contacto"}
                      target={wa ? "_blank" : undefined}
                      rel={wa ? "noopener" : undefined}
                      onClick={() => {
                        if (!wa) window.dispatchEvent(new CustomEvent(COTIZAR_EVENT, { detail: paquete.nombre }));
                      }}
                      aria-label={`Cotizar ${paquete.nombre}`}
                      className="inline-flex h-11 items-center rounded-full border border-border px-5 text-sm font-medium transition-colors hover:border-foreground"
                    >
                      Cotizar este paquete
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
