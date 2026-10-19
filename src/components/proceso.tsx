import { FadeUp, RevealText } from "@/components/motion";

const PASOS = [
  { titulo: "Escríbenos", texto: "Cuéntanos qué celebras, la fecha y el lugar. Por WhatsApp o con el formulario." },
  { titulo: "Recibe tu cotización", texto: "Te enviamos opciones y precios según las horas y lo que quieras recibir." },
  { titulo: "Separa la fecha", texto: "Con un anticipo, el día queda reservado para ti." },
  { titulo: "Sesión y entrega", texto: "Fotografiamos tu momento y te entregamos las fotos editadas." },
];

export function Proceso() {
  return (
    <section id="proceso" data-parada="inicio" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <FadeUp>
          <p className="antetitulo text-muted-foreground">Cómo trabajamos</p>
        </FadeUp>
        <RevealText text="De tu mensaje a tus fotos" italic={[5]} className="mt-4 max-w-3xl text-5xl leading-none sm:text-7xl" />

        <ol className="mt-16 grid gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-2 lg:grid-cols-4">
          {PASOS.map((paso, i) => (
            <li key={paso.titulo} className="bg-background">
              <FadeUp delay={i * 0.1} className="flex h-full flex-col p-8">
                <span className="font-display text-6xl italic leading-none text-foreground/20">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-10 text-3xl leading-tight">{paso.titulo}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{paso.texto}</p>
              </FadeUp>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
