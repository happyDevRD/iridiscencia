import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import siteConfig from "@/content/site.json";
import { cotizarHref, whatsappUrl } from "@/lib/contact";
import { useHeroOscuro } from "@/components/heroes/usos";

const links = [
  { href: "#trabajo", label: "Trabajo" },
  { href: "#sesiones", label: "Sesiones" },
  { href: "#proceso", label: "Cómo trabajamos" },
  { href: "#contacto", label: "Contacto" },
];

export function Navbar() {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const whatsapp = whatsappUrl("Hola, quiero cotizar una sesión con Iridiscencia.");
  // Sobre un hero oscuro y arriba del todo, el menú va en blanco
  const heroOscuro = useHeroOscuro();
  const sobreOscuro = heroOscuro && !scrolled && !open;

  // Se esconde al bajar y vuelve al subir, para no tapar las fotos.
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 10);
    setHidden(y > 400 && y > prev && !open);
  });

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
    return () => observer.disconnect();
  }, []);

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "border-b border-border bg-background/85 backdrop-blur-xl" : "border-b border-transparent"
      } ${sobreOscuro ? "text-white" : ""}`}
    >
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <a href="#inicio" className="font-display text-2xl tracking-tight">
          {siteConfig.nombre}
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const actual = active === link.href.slice(1);
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={actual ? "location" : undefined}
                className={`relative rounded-full px-4 py-2 text-sm transition-colors ${
                  sobreOscuro
                    ? "text-white/80 hover:text-white"
                    : "text-muted-foreground hover:text-foreground aria-[current]:text-foreground"
                }`}
              >
                {actual && (
                  <motion.span layoutId="nav-activo" className="absolute inset-0 rounded-full bg-card" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                )}
                <span className="relative">{link.label}</span>
              </a>
            );
          })}
          <a
            href={cotizarHref()}
            target={whatsapp ? "_blank" : undefined}
            rel={whatsapp ? "noopener" : undefined}
            className={`group ml-3 inline-flex h-11 items-center gap-1.5 rounded-full pl-5 pr-4 text-sm font-medium transition-colors ${
              sobreOscuro ? "bg-white text-tinta hover:bg-white/85" : "bg-foreground text-background hover:bg-foreground/85"
            }`}
          >
            Cotizar
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
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

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-movil"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden lg:hidden"
          >
            <div className="px-5 pb-8 pt-2">
              {links.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.05 + i * 0.05 } }}
                  className="block border-b border-border py-4 font-display text-4xl"
                >
                  {link.label}
                </motion.a>
              ))}
              <a
                href={cotizarHref()}
                target={whatsapp ? "_blank" : undefined}
                rel={whatsapp ? "noopener" : undefined}
                onClick={() => setOpen(false)}
                className="mt-6 flex h-13 items-center justify-center rounded-full bg-foreground font-medium text-background"
              >
                {whatsapp ? "Cotizar por WhatsApp" : "Pedir cotización"}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
