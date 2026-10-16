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
    <footer id="contacto" className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24">
        <div>
          <h2 className="text-5xl leading-none sm:text-6xl">Cuéntanos de tu evento</h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
            Con el tipo de evento y la fecha te enviamos la cotización. Si prefieres hablar directo, usa cualquiera
            de estos canales.
          </p>

          <ul className="mt-10 space-y-5">
            {canales.map(({ href, icon: Icon, label, value, external }) => (
              <li key={label}>
                <a
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener" : undefined}
                  className="group flex items-center gap-4"
                >
                  <Icon className="size-5 text-muted-foreground" aria-hidden />
                  <span>
                    <span className="block text-sm text-muted-foreground">{label}</span>
                    <span className="underline-offset-4 group-hover:underline">{value}</span>
                  </span>
                </a>
              </li>
            ))}
            <li className="flex items-center gap-4">
              <MapPin className="size-5 text-muted-foreground" aria-hidden />
              <span>
                <span className="block text-sm text-muted-foreground">Estudio</span>
                {contacto.direccion || siteConfig.ubicacion}
              </span>
            </li>
          </ul>
        </div>

        <ContactForm />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-border px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-8">
        <p className="font-display text-lg text-foreground">{siteConfig.nombre}</p>
        <p>© {new Date().getFullYear()} {siteConfig.nombre}. {siteConfig.ubicacion}.</p>
      </div>
    </footer>
  );
}
