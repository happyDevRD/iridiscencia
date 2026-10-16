import { AtSign, Mail, MapPin, MessageCircle } from "lucide-react";
import siteConfig from "@/content/site.json";
import { ContactForm } from "@/components/contact-form";
import { instagramUrl, whatsappUrl } from "@/lib/contact";

export function ContactoFooter() {
  const { contacto } = siteConfig;
  const whatsapp = whatsappUrl("Hola, quiero cotizar una sesión con Iridiscencia.");
  const instagram = instagramUrl();

  const canales = [
    whatsapp && { href: whatsapp, icon: MessageCircle, label: "WhatsApp", value: contacto.whatsapp, external: true },
    instagram && {
      href: instagram,
      icon: AtSign,
      label: "Instagram",
      value: `@${contacto.instagram.replace(/^@|.*instagram\.com\//g, "").replace(/\/$/, "")}`,
      external: true,
    },
    { href: `mailto:${contacto.email}`, icon: Mail, label: "Correo", value: contacto.email, external: false },
  ].filter(Boolean) as { href: string; icon: typeof Mail; label: string; value: string; external: boolean }[];

  return (
    <footer id="contacto" className="border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p className="etiqueta text-muted-foreground">Contacto</p>
          <h2 className="mt-4 text-5xl leading-none sm:text-6xl">Cuéntanos de tu evento</h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            Con el tipo de evento y la fecha te enviamos la cotización. Si prefieres hablar directo, usa cualquiera
            de estos canales.
          </p>

          <ul className="mt-10 divide-y divide-border border-y border-border">
            {canales.map(({ href, icon: Icon, label, value, external }) => (
              <li key={label}>
                <a
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener" : undefined}
                  className="group flex min-h-14 items-center gap-4 py-3"
                >
                  <Icon className="size-5 text-muted-foreground" aria-hidden />
                  <span className="etiqueta hidden w-24 shrink-0 text-muted-foreground sm:block">{label}</span>
                  <span className="min-w-0 break-words underline-offset-4 group-hover:underline">{value}</span>
                </a>
              </li>
            ))}
            <li className="flex min-h-14 items-center gap-4 py-3">
              <MapPin className="size-5 text-muted-foreground" aria-hidden />
              <span className="etiqueta hidden w-24 shrink-0 text-muted-foreground sm:block">Estudio</span>
              <span>{contacto.direccion || siteConfig.ubicacion}</span>
            </li>
          </ul>
        </div>

        <div className="bg-card p-5 shadow-[0_1px_2px_rgb(0_0_0/0.06),0_24px_48px_-28px_rgb(0_0_0/0.3)] sm:p-8 lg:col-span-6 lg:col-start-7">
          <div className="mb-6 flex items-baseline justify-between gap-4 border-b-2 border-foreground pb-3">
            <p className="etiqueta">Solicitud de cotización</p>
            <p className="whitespace-nowrap font-mano text-2xl leading-none text-lapiz [transform:rotate(-1.5deg)]">sin compromiso</p>
          </div>
          <ContactForm />
        </div>
      </div>

      <div className="pelicula">
        <div className="borde-impreso mx-auto flex max-w-7xl flex-col gap-3 px-5 text-[11px] sm:flex-row sm:justify-between sm:px-8">
          <p>{siteConfig.nombre.toUpperCase()} FILM ▸ {siteConfig.ubicacion.toUpperCase()}</p>
          <p>
            © {new Date().getFullYear()} {siteConfig.nombre.toUpperCase()} ▸ FIN DEL ROLLO
          </p>
        </div>
      </div>
    </footer>
  );
}
