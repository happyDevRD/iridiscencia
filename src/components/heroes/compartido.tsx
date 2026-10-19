import { ArrowUpRight } from "lucide-react";
import siteConfig from "@/content/site.json";
import { cotizarHref, whatsappUrl } from "@/lib/contact";
import { FadeUp, RevealText } from "@/components/motion";
import { IconoWhatsapp } from "@/components/whatsapp";
import { cn } from "@/lib/utils";

// ── Texto del hero ─────────────────────────────────────────────────────────────

/** Titular, bajada y botones; `oscuro` = texto blanco sobre fotos. */
export function HeroTexto({
  oscuro = false,
  centrado = false,
  className,
}: {
  oscuro?: boolean;
  centrado?: boolean;
  className?: string;
}) {
  const whatsapp = whatsappUrl("Hola, quiero cotizar una sesión con Iridiscencia.");
  return (
    <div className={cn(centrado && "mx-auto text-center", className)}>
      <FadeUp>
        <p className={cn("antetitulo", oscuro ? "text-white/75" : "text-muted-foreground")}>
          Estudio de fotografía · {siteConfig.ubicacion.split(",")[0]}
        </p>
      </FadeUp>
      <RevealText
        as="h1"
        text="Fotografía que captura lo irrepetible"
        italic={[4]}
        delay={0.1}
        className={cn("mt-6 text-[clamp(3rem,7vw,7.5rem)] leading-[0.98]", oscuro && "text-white")}
      />
      <FadeUp delay={0.5}>
        <p
          className={cn(
            "mt-7 max-w-lg text-lg leading-relaxed",
            centrado && "mx-auto",
            oscuro ? "text-white/85" : "text-muted-foreground"
          )}
        >
          Bodas, XV años, maternidad, graduaciones y retratos. En nuestro estudio o donde sea tu celebración.
        </p>
        <div className={cn("mt-9 flex flex-wrap gap-3", centrado && "justify-center")}>
          <a
            href={cotizarHref()}
            target={whatsapp ? "_blank" : undefined}
            rel={whatsapp ? "noopener" : undefined}
            className={cn(
              "group inline-flex h-13 items-center gap-2 rounded-full pl-7 pr-5 font-medium transition-colors",
              oscuro ? "bg-white text-tinta hover:bg-white/85" : "bg-foreground text-background hover:bg-foreground/85"
            )}
          >
            {whatsapp && <IconoWhatsapp className="size-5" />}
            {whatsapp ? "Cotizar por WhatsApp" : "Pedir cotización"}
            {!whatsapp && (
              <ArrowUpRight
                className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden
              />
            )}
          </a>
          <a
            href="#trabajo"
            className={cn(
              "inline-flex h-13 items-center rounded-full border px-7 font-medium transition-colors",
              oscuro ? "border-white/40 text-white hover:bg-white/10" : "border-foreground/15 hover:border-foreground"
            )}
          >
            Ver el trabajo
          </a>
        </div>
      </FadeUp>
    </div>
  );
}

const SERVICIOS = ["Bodas", "XV años", "Maternidad", "Graduaciones", "Retratos", "Cumpleaños", "Eventos"];

/** Cinta de servicios que corre sola, debajo de cualquier hero. */
export function CintaServicios() {
  return (
    <div className="overflow-hidden border-b border-border py-6" aria-hidden>
      <div className="marquee flex w-max">
        {[0, 1].map((copia) => (
          <div key={copia} className="flex shrink-0 items-center">
            {SERVICIOS.map((s) => (
              <span key={s} className="flex items-center font-display text-4xl italic sm:text-5xl">
                <span className="px-8">{s}</span>
                <span className="size-1.5 rounded-full bg-foreground/30" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
