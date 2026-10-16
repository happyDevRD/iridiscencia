const PASOS = [
  { titulo: "Escríbenos", texto: "Cuéntanos qué celebras, la fecha y el lugar. Por WhatsApp o con el formulario." },
  { titulo: "Recibe la cotización", texto: "Te enviamos las opciones y precios según las horas y lo que quieras recibir." },
  { titulo: "Separa tu fecha", texto: "Con un anticipo, la fecha queda reservada para ti y nadie más la toma." },
  { titulo: "Sesión y entrega", texto: "Fotografiamos tu día y te entregamos las fotos editadas." },
];

export function Proceso() {
  return (
    <section id="proceso" className="border-t border-border bg-pelicula text-papel">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <p className="etiqueta text-ambar">Cómo trabajamos</p>
        <h2 className="mt-4 max-w-2xl text-5xl leading-none sm:text-6xl">De tu mensaje a tus fotos</h2>

        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {PASOS.map((paso, i) => (
            <li key={paso.titulo} className="border-t border-papel/25 pt-5">
              <p className="borde-impreso text-[11px]" aria-hidden>
                PASO {i + 1} ▸
              </p>
              <h3 className="mt-4 text-2xl leading-tight">{paso.titulo}</h3>
              <p className="mt-3 leading-relaxed text-velado">{paso.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
