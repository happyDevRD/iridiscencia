import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import paquetesData from "@/content/paquetes.json";
import { type Catalogo, fetchCatalogo, formatoPrecio, productosPorPrefijo } from "@/lib/catalogo";
import { COTIZAR_EVENT, whatsappUrl } from "@/lib/contact";
import { Visto } from "@/components/pelicula";

function precioTexto(precioDesde: string) {
  const p = precioDesde.trim();
  return !p || /consultar/i.test(p) ? "Precio según la cobertura" : `Desde ${p}`;
}

function mensajeDe(nombres: string[]) {
  return nombres.length === 1
    ? `Hola, quiero cotizar una sesión de ${nombres[0]}.`
    : `Hola, quiero cotizar estas sesiones: ${nombres.join(", ")}.`;
}

export function Paquetes() {
  // Los combos y precios salen de ProStock; si el catálogo no carga, cada
  // sesión se muestra con el texto del CMS.
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null);
  const [marcadas, setMarcadas] = useState<string[]>([]);

  useEffect(() => {
    let vivo = true;
    fetchCatalogo().then((c) => {
      if (vivo) setCatalogo(c);
    });
    return () => {
      vivo = false;
    };
  }, []);

  const nombres = paquetesData.paquetes.filter((p) => marcadas.includes(p.id)).map((p) => p.nombre);
  const wa = nombres.length > 0 ? whatsappUrl(mensajeDe(nombres)) : null;

  function alternar(id: string) {
    setMarcadas((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  }

  return (
    <section id="sesiones" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="etiqueta text-muted-foreground">Hoja de pedido</p>
            <h2 className="mt-4 text-5xl leading-none sm:text-6xl">Sesiones</h2>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground lg:col-span-5">
            Cada cobertura se arma según tu evento: horas, lugares y lo que quieras recibir. Marca las que te
            interesan y te enviamos la cotización.
          </p>
        </div>

        <div className="relative mt-12 bg-card px-5 pb-6 pt-5 shadow-[0_1px_2px_rgb(0_0_0/0.06),0_24px_48px_-28px_rgb(0_0_0/0.3)] sm:px-8">
          <div className="flex items-baseline justify-between gap-4 border-b-2 border-foreground pb-3">
            <p className="etiqueta">Pedido de sesión</p>
            <p className="whitespace-nowrap font-mano text-2xl leading-none text-lapiz [transform:rotate(-1.5deg)]">marca las que quieras</p>
          </div>

          <ul className="grid lg:grid-cols-2 lg:gap-x-12">
            {paquetesData.paquetes.map((paquete) => {
              const combos = productosPorPrefijo(catalogo, paquete.prefijosSku ?? []);
              const marcada = marcadas.includes(paquete.id);
              const precio =
                combos.length > 0
                  ? `Desde ${formatoPrecio(combos[0].precio)}${catalogo?.preciosIncluyenItbis ? " · ITBIS incl." : ""}`
                  : precioTexto(paquete.precioDesde);
              return (
                <li key={paquete.id} className="border-b border-border py-5">
                  <label className="flex cursor-pointer gap-4">
                    <input
                      type="checkbox"
                      checked={marcada}
                      onChange={() => alternar(paquete.id)}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden
                      className="relative mt-1 size-6 shrink-0 border-[1.5px] border-foreground/60 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foreground"
                    >
                      <Visto dibujado={marcada} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <span className="text-2xl font-semibold leading-tight [font-stretch:72%]">{paquete.nombre}</span>
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">{precio}</span>
                      </span>
                      <span className="mt-1.5 block leading-relaxed text-muted-foreground">{paquete.descripcion}</span>
                    </span>
                  </label>

                  {combos.length > 0 && (
                    <details className="group/combos ml-10 mt-3">
                      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
                        Ver {combos.length === 1 ? "el combo" : `los ${combos.length} combos`}
                        <ChevronDown className="size-4 transition-transform group-open/combos:rotate-180" aria-hidden />
                      </summary>
                      <ul className="mt-1 divide-y divide-border border-t border-border">
                        {combos.map((combo) => (
                          <li key={combo.sku} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                            <div className="min-w-0">
                              <p className="font-medium">{combo.nombre}</p>
                              {combo.incluye.length > 0 && (
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{combo.incluye.join(" · ")}</p>
                              )}
                            </div>
                            <p className="shrink-0 font-mono text-sm tabular-nums">
                              {combo.enPromocion && (
                                <span className="mr-2 text-muted-foreground line-through">{formatoPrecio(combo.precioRegular)}</span>
                              )}
                              {formatoPrecio(combo.precio)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="sticky bottom-3 z-10 mt-6 flex items-center justify-between gap-3 bg-foreground py-2 pl-4 pr-2 text-background sm:pl-5">
            <p className="text-sm" aria-live="polite">
              {nombres.length === 0
                ? "Marca una o varias."
                : nombres.length === 1
                  ? `Marcaste ${nombres[0]}.`
                  : `Marcaste ${nombres.length} sesiones.`}
            </p>
            <a
              href={wa ?? "#contacto"}
              target={wa ? "_blank" : undefined}
              rel={wa ? "noopener" : undefined}
              aria-disabled={nombres.length === 0}
              onClick={(e) => {
                if (nombres.length === 0) return e.preventDefault();
                if (!wa) window.dispatchEvent(new CustomEvent(COTIZAR_EVENT, { detail: nombres }));
              }}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-sm bg-card px-4 sm:px-5 font-medium text-foreground transition-opacity aria-disabled:pointer-events-none aria-disabled:opacity-45"
            >
              {wa ? "Cotizar por WhatsApp" : "Pedir cotización"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
