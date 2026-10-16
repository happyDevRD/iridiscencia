import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import siteConfig from "@/content/site.json";
import { cotizarHref, whatsappUrl } from "@/lib/contact";

const links = [
  { href: "#trabajo", label: "Trabajo" },
  { href: "#sesiones", label: "Sesiones" },
  { href: "#proceso", label: "Cómo trabajamos" },
  { href: "#contacto", label: "Contacto" },
];

function Marca() {
  return (
    <span className="flex items-baseline gap-2">
      <span className="text-lg font-semibold uppercase leading-none tracking-[0.14em] [font-stretch:125%]">
        {siteConfig.nombre}
      </span>
      <span className="font-mono text-[10px] uppercase leading-none tracking-[0.2em] text-muted-foreground">Film</span>
    </span>
  );
}

export function Navbar() {
  const [active, setActive] = useState("");
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
      setScrolled(window.scrollY > 8);
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
      className={`fixed inset-x-0 top-0 z-50 bg-background/92 backdrop-blur-md transition-[border-color] ${
        scrolled || open ? "border-b border-border" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <a href="#inicio" aria-label={`${siteConfig.nombre}, ir al inicio`}>
          <Marca />
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={active === link.href.slice(1) ? "location" : undefined}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground aria-[current]:text-foreground aria-[current]:underline aria-[current]:decoration-lapiz aria-[current]:decoration-2 aria-[current]:underline-offset-8"
            >
              {link.label}
            </a>
          ))}
          <a
            href={cotizarHref()}
            target={whatsapp ? "_blank" : undefined}
            rel={whatsapp ? "noopener" : undefined}
            className="inline-flex h-10 items-center rounded-sm bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
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
          className="-mr-2 p-2.5 lg:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {open && (
        <div id="menu-movil" className="border-t border-border px-5 pb-6 pt-2 lg:hidden">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block border-b border-border py-4 text-3xl font-semibold [font-stretch:72%]"
            >
              {link.label}
            </a>
          ))}
          <a
            href={cotizarHref()}
            target={whatsapp ? "_blank" : undefined}
            rel={whatsapp ? "noopener" : undefined}
            onClick={() => setOpen(false)}
            className="mt-6 flex h-12 items-center justify-center rounded-sm bg-foreground font-medium text-background"
          >
            {whatsapp ? "Cotizar por WhatsApp" : "Pedir cotización"}
          </a>
        </div>
      )}
    </header>
  );
}
