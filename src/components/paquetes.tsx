import paquetesData from "@/content/paquetes.json";
import { COTIZAR_EVENT, whatsappUrl } from "@/lib/contact";

function precio(precioDesde: string) {
  const p = precioDesde.trim();
  return !p || /consultar/i.test(p) ? "Precio según la cobertura" : `Desde ${p}`;
}

export function Paquetes() {
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
          {paquetesData.paquetes.map((paquete) => {
            const wa = whatsappUrl(`Hola, quiero cotizar el paquete de ${paquete.nombre}.`);
            return (
              <li key={paquete.id} className="grid gap-6 py-8 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                <div className="aspect-[3/2] overflow-hidden rounded-sm bg-card">
                  <img src={paquete.imagen} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-col justify-between gap-6">
                  <div>
                    <h3 className="text-4xl leading-tight">{paquete.nombre}</h3>
                    <p className="mt-3 max-w-prose leading-relaxed text-muted-foreground">{paquete.descripcion}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">{precio(paquete.precioDesde)}</p>
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
