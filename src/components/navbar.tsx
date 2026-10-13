import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import siteConfig from "@/content/site.json";

const links = [
  { href: "#inicio", label: "Inicio" },
  { href: "#proyectos", label: "Proyectos" },
  { href: "#paquetes", label: "Paquetes" },
  { href: "#contacto", label: "Contacto" },
];

export function Navbar() {
  const [active, setActive] = useState("inicio");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="flex w-full max-w-3xl items-center justify-between gap-4 rounded-full border border-border bg-card/80 px-4 py-2 backdrop-blur-md">
        <a
          href="#inicio"
          aria-label={siteConfig.nombre}
          className="accent-gradient flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-background"
        >
          IR
        </a>

        <div className="hidden items-center gap-1 text-sm sm:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                active === link.href.slice(1)
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href={`mailto:${siteConfig.contacto.email}`}
          className="hidden shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:accent-gradient hover:border-transparent hover:text-background sm:flex"
        >
          Say Hi
          <ArrowUpRight className="size-4" />
        </a>

        <button
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
          className="text-foreground sm:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="absolute top-full mt-2 flex w-full max-w-3xl flex-col gap-1 rounded-2xl border border-border bg-card p-3 text-sm sm:hidden">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <a
            href={`mailto:${siteConfig.contacto.email}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-foreground"
          >
            Say Hi <ArrowUpRight className="size-4" />
          </a>
        </div>
      )}
    </header>
  );
}
