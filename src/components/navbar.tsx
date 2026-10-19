import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import siteConfig from "@/content/site.json";
import { cotizarHref, instagramUrl, telefonoUrl, whatsappUrl } from "@/lib/contact";
import { Isotipo } from "@/components/logo";
import { useHeroOscuro } from "@/components/heroes/usos";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const links = [
  { href: "#trabajo", label: "Trabajo" },
  { href: "#sesiones", label: "Sesiones" },
  { href: "#proceso", label: "Cómo trabajamos" },
  { href: "#contacto", label: "Contacto" },
];

/**
 * Arriba del todo, el menú ocupa el ancho sin fondo. Al bajar se encoge en una cápsula
 * flotante: oscura mientras sigue sobre el hero y clara después. Se esconde al bajar
 * y vuelve al subir, para no tapar las fotos.
 */
export function Navbar() {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [sobreHero, setSobreHero] = useState(true);
  const { scrollY } = useScroll();
  const whatsapp = whatsappUrl("Hola, quiero cotizar una sesión con Iridiscencia.");
  const instagram = instagramUrl();
  const telefono = telefonoUrl();
  const heroOscuro = useHeroOscuro();
  // Texto blanco sobre el hero oscuro y con el menú móvil abierto (fondo oscuro)
  const oscuro = open || (heroOscuro && sobreHero);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    const alto = document.getElementById("inicio")?.offsetHeight ?? 0;
    setScrolled(y > 10);
    setSobreHero(y < alto - 72);
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

  // Menú móvil abierto: sin scroll de fondo y Escape lo cierra
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const capsula = scrolled && !open;

  return (
    <>
      <motion.header
        animate={{ y: hidden ? "-120%" : 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className={cn("fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ease-suave", capsula && "px-3 pt-3")}
      >
        <nav
          className={cn(
            "mx-auto flex items-center justify-between gap-6 border transition-[max-width,height,background-color,border-color,border-radius,padding,box-shadow,color] duration-500 ease-suave",
            capsula
              ? "h-14 max-w-[60rem] rounded-full pl-6 pr-2 shadow-[0_12px_40px_-16px_rgb(0_0_0/0.35)] backdrop-blur-xl"
              : "h-18 max-w-[80rem] rounded-none border-transparent px-5 sm:px-8",
            capsula && (oscuro ? "border-white/10 bg-black/35" : "border-border bg-background/80"),
            oscuro && "text-white"
          )}
        >
          <a href="#inicio" onClick={() => setOpen(false)} className="flex items-center gap-2.5 font-display text-2xl tracking-tight">
            <Isotipo className="size-9" />
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
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm transition-colors",
                    oscuro
                      ? "text-white/75 hover:text-white aria-[current]:text-white"
                      : "text-muted-foreground hover:text-foreground aria-[current]:text-foreground"
                  )}
                >
                  {actual && (
                    <motion.span
                      layoutId="nav-activo"
                      className={cn("absolute inset-0 rounded-full", oscuro ? "bg-white/15" : "bg-card")}
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </a>
              );
            })}
            <a
              href={cotizarHref()}
              target={whatsapp ? "_blank" : undefined}
              rel={whatsapp ? "noopener" : undefined}
              className={cn(
                "group ml-3 inline-flex h-10 items-center gap-1.5 rounded-full pl-5 pr-4 text-sm font-medium transition-colors",
                oscuro ? "bg-white text-tinta hover:bg-white/85" : "bg-foreground text-background hover:bg-foreground/85"
              )}
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
            className="relative -mr-1 grid size-11 place-items-center rounded-full lg:hidden"
          >
            {/* Dos líneas que se cruzan en una X */}
            <span
              aria-hidden
              className={cn(
                "absolute h-px w-6 bg-current transition-transform duration-300 ease-suave",
                open ? "rotate-45" : "-translate-y-1"
              )}
            />
            <span
              aria-hidden
              className={cn(
                "absolute h-px w-6 bg-current transition-transform duration-300 ease-suave",
                open ? "-rotate-45" : "translate-y-1"
              )}
            />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-movil"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="fixed inset-0 z-40 flex flex-col bg-tinta px-5 pb-8 pt-24 text-white sm:px-8 lg:hidden"
          >
            <nav aria-label="Menú" className="flex-1">
              {links.map((link, i) => (
                <div key={link.href} className="overflow-hidden border-b border-white/10">
                  <motion.a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    initial={{ y: "100%" }}
                    animate={{ y: 0, transition: { duration: 0.6, ease: EASE, delay: 0.15 + i * 0.06 } }}
                    className="flex items-baseline gap-4 py-5 font-display text-[clamp(2.5rem,11vw,4rem)] leading-none"
                  >
                    <span className="font-sans text-xs tabular-nums text-white/40">0{i + 1}</span>
                    {link.label}
                  </motion.a>
                </div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.45, duration: 0.5 } }}
            >
              <a
                href={cotizarHref()}
                target={whatsapp ? "_blank" : undefined}
                rel={whatsapp ? "noopener" : undefined}
                onClick={() => setOpen(false)}
                className="flex h-13 items-center justify-center gap-2 rounded-full bg-white font-medium text-tinta"
              >
                {whatsapp ? "Cotizar por WhatsApp" : "Pedir cotización"}
                <ArrowUpRight className="size-4" aria-hidden />
              </a>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-white/80">
                {telefono && (
                  <a href={telefono} className="hover:text-white">
                    {siteConfig.contacto.telefono}
                  </a>
                )}
                <a href={`mailto:${siteConfig.contacto.email}`} className="hover:text-white">
                  {siteConfig.contacto.email}
                </a>
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener" className="hover:text-white">
                    Instagram
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
