import data from "@/content/paquetes.json";

export default function PaquetesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-12 text-center font-serif text-3xl sm:text-4xl">Paquetes</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {data.paquetes.map((paquete) => (
          <div key={paquete.id} className="border border-white/10 p-6">
            <h2 className="font-serif text-xl">{paquete.nombre}</h2>
            <p className="mt-3 text-sm text-white/60">{paquete.descripcion}</p>
            <p className="mt-6 text-sm text-white/40">Desde: {paquete.precioDesde}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
