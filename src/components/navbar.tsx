import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import siteConfig from "@/content/site.json";
import { cotizarHref, whatsappUrl } from "@/lib/contact";

const links = [
  { href: "#trabajo", label: "Trabajo" },
  { href: "#paquetes", label: "Paquetes" },
  { href: "#contacto", label: "Contacto" },
];

export function Navbar() {
  const [active, setActive] = useState("inicio");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const whatsapp = whatsappUrl("Hola, quiero cotizar una sesión con Iridiscencia.");

  useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => observer.observe(s));

    function handleScroll() {
      setScrolled(window.scrollY > window.innerHeight * 0.6);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "border-b border-border bg-background/90 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <a
          href="#inicio"
          className={`font-display text-2xl transition-opacity duration-300 ${
            scrolled || open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          tabIndex={scrolled || open ? 0 : -1}
        >
          {siteConfig.nombre}
        </a>

        <div className="hidden items-center gap-8 sm:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={active === link.href.slice(1) ? "location" : undefined}
              className="text-sm text-foreground/70 transition-colors hover:text-foreground aria-[current]:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <a
            href={cotizarHref()}
            target={whatsapp ? "_blank" : undefined}
            rel={whatsapp ? "noopener" : undefined}
            className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
          >
            Cotizar
          </a>
        </div>

        <button
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="menu-movil"
          onClick={() => setOpen((v) => !v)}
          className="-mr-2 p-2 text-foreground sm:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {open && (
        <div id="menu-movil" className="border-t border-border px-5 pb-6 pt-2 sm:hidden">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-3 font-display text-3xl"
            >
              {link.label}
            </a>
          ))}
          <a
            href={cotizarHref()}
            target={whatsapp ? "_blank" : undefined}
            rel={whatsapp ? "noopener" : undefined}
            onClick={() => setOpen(false)}
            className="mt-4 flex h-12 items-center justify-center rounded-full bg-foreground font-medium text-background"
          >
            {whatsapp ? "Cotizar por WhatsApp" : "Pedir cotización"}
          </a>
        </div>
      )}
    </header>
  );
}
