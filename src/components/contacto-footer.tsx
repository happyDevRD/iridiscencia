import type { ComponentType } from "react";
import { AtSign, Mail, MapPin, Phone } from "lucide-react";
import { IconoWhatsapp } from "@/components/whatsapp";
import { motion, useReducedMotion } from "motion/react";
import siteConfig from "@/content/site.json";
import { ContactForm } from "@/components/contact-form";
import { FadeUp, RevealText } from "@/components/motion";
import { instagramUrl, mapaUrl, telefonoUrl, whatsappUrl } from "@/lib/contact";
import { LogoCompleto } from "@/components/logo";

export function ContactoFooter() {
  const { contacto } = siteConfig;
  const whatsapp = whatsappUrl("Hola, quiero cotizar una sesión con Iridiscencia.");
  const instagram = instagramUrl();
  // Si el teléfono es el mismo número del WhatsApp, basta con una fila
  const mismoNumero = contacto.telefono.replace(/\D/g, "") === contacto.whatsapp.replace(/\D/g, "");
  const telefono = whatsapp && mismoNumero ? null : telefonoUrl();
  const mapa = mapaUrl();
  const reduce = useReducedMotion();

  const canales = [
    whatsapp && {
      href: whatsapp,
      icon: IconoWhatsapp,
      label: mismoNumero ? "WhatsApp y llamadas" : "WhatsApp",
      value: contacto.whatsapp,
      external: true,
    },
    instagram && {
      href: instagram,
      icon: AtSign,
      label: "Instagram",
      value: `@${contacto.instagram.replace(/^@|.*instagram\.com\//g, "").replace(/\/$/, "")}`,
      external: true,
    },
    telefono && { href: telefono, icon: Phone, label: "Teléfono", value: contacto.telefono, external: false },
    { href: `mailto:${contacto.email}`, icon: Mail, label: "Correo", value: contacto.email, external: false },
  ].filter(Boolean) as { href: string; icon: ComponentType<{ className?: string }>; label: string; value: string; external: boolean }[];

  return (
    <footer id="contacto" data-parada="inicio" className="bg-card">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <FadeUp>
            <p className="antetitulo text-muted-foreground">Contacto</p>
          </FadeUp>
          <RevealText text="Cuéntanos de tu evento" italic={[3]} className="mt-4 text-5xl leading-none sm:text-7xl" />
          <FadeUp delay={0.15}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              Con el tipo de evento y la fecha te enviamos la cotización. Si prefieres hablar directo, usa cualquiera de
              estos canales.
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
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-background">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm text-muted-foreground">{label}</span>
                      <span className="break-words underline-offset-4 group-hover:underline">{value}</span>
                    </span>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={mapa ?? undefined}
                  target="_blank"
                  rel="noopener"
                  className="group flex items-start gap-4"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-background">
                    <MapPin className="size-4" aria-hidden />
                  </span>
                  <span className="max-w-sm">
                    <span className="block text-sm text-muted-foreground">Estudio{mapa && " · ver en el mapa"}</span>
                    <span className="underline-offset-4 group-hover:underline">{contacto.direccion || siteConfig.ubicacion}</span>
                  </span>
                </a>
              </li>
            </ul>
          </FadeUp>
        </div>

        <FadeUp delay={0.1} className="rounded-xl bg-background p-6 sm:p-10 lg:col-span-6 lg:col-start-7">
          <ContactForm />
        </FadeUp>
      </div>

      <div className="overflow-hidden border-t border-border">
        <motion.p
          aria-hidden
          initial={reduce ? false : { y: "40%", opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="select-none px-3 pt-6 text-center font-display text-[17.5vw] leading-[0.85] tracking-[-0.04em]"
        >
          {siteConfig.nombre}
        </motion.p>
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <LogoCompleto className="h-14 text-foreground" />
          <p>
            © {new Date().getFullYear()} {siteConfig.nombre}. {siteConfig.ubicacion}.
          </p>
          <p>Fotografía de bodas, XV años, maternidad y retratos.</p>
        </div>
      </div>
    </footer>
  );
}
