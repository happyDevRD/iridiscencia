import paquetesData from "@/content/paquetes.json";

export function Paquetes() {
  return (
    <section id="paquetes" className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-28">
        <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">Servicios</p>
        <h2 className="mt-3 font-display text-4xl italic text-foreground sm:text-5xl">Paquetes</h2>
        <p className="mt-4 max-w-lg text-muted-foreground">
          Cada sesión se adapta a tu evento — escríbenos para armar la cotización ideal.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {paquetesData.paquetes.map((paquete) => (
            <div
              key={paquete.id}
              className="group overflow-hidden rounded-2xl border border-border bg-background transition-colors hover:border-transparent"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={paquete.imagen}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl italic text-foreground">{paquete.nombre}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{paquete.descripcion}</p>
                <p className="mt-6 text-sm text-muted-foreground/70">Desde: {paquete.precioDesde}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
