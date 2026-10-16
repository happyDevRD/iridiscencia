import { useEffect, useRef, useState } from "react";
import siteConfig from "@/content/site.json";
import { ApertureIntro } from "@/components/aperture-intro";
import { cotizarHref, whatsappUrl } from "@/lib/contact";

const SLIDE_MS = 7000;
const fotos = siteConfig.heroFotos;

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Para fotos de Unsplash (placeholders) pide el ancho justo; las propias se sirven tal cual. */
function srcSet(src: string) {
  if (!src.includes("images.unsplash.com")) return undefined;
  return [1280, 1920, 2560, 3200].map((w) => `${src}&w=${w} ${w}w`).join(", ");
}

/**
 * Mueve el "punto de luz" del nombre: sigue al puntero en escritorio y deriva
 * despacio por sí solo en táctil. Con reduced motion queda fijo.
 */
function useIrisLight() {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    function set(xPct: number, yPct: number) {
      el!.style.setProperty("--x", `${xPct}%`);
      el!.style.setProperty("--y", `${yPct}%`);
      el!.style.setProperty("--angle", `${90 + xPct * 1.8}deg`);
    }

    if (window.matchMedia("(hover: hover)").matches) {
      function handleMove(e: PointerEvent) {
        const r = el!.getBoundingClientRect();
        set(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
      }
      window.addEventListener("pointermove", handleMove);
      return () => window.removeEventListener("pointermove", handleMove);
    }

    let frame: number;
    function drift(t: number) {
      set(50 + Math.sin(t / 2600) * 42, 50 + Math.cos(t / 1900) * 30);
      frame = requestAnimationFrame(drift);
    }
    frame = requestAnimationFrame(drift);
    return () => cancelAnimationFrame(frame);
  }, []);

  return ref;
}

export function Hero() {
  const [open, setOpen] = useState(prefersReducedMotion);
  const [firstLoaded, setFirstLoaded] = useState(false);
  const [{ active, previous }, setSlide] = useState<{ active: number; previous: number | null }>({
    active: 0,
    previous: null,
  });
  const wordmarkRef = useIrisLight();
  const whatsapp = whatsappUrl("Hola, quiero cotizar una sesión con Iridiscencia.");

  // Si la foto tarda, el diafragma no espera para siempre.
  useEffect(() => {
    const timeout = window.setTimeout(() => setFirstLoaded(true), 2500);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!open || fotos.length < 2 || prefersReducedMotion()) return;
    const interval = window.setInterval(() => {
      setSlide(({ active }) => ({ active: (active + 1) % fotos.length, previous: active }));
    }, SLIDE_MS);
    return () => window.clearInterval(interval);
  }, [open]);

  return (
    <section
      id="inicio"
      data-open={open}
      className="group relative flex min-h-svh flex-col justify-end overflow-hidden bg-background"
    >
      {fotos.map((foto, i) => {
        const shown = i === active;
        // Solo se cargan la actual y la siguiente.
        if (!shown && i !== previous && i !== (active + 1) % fotos.length) return null;
        return (
          <img
            key={foto.src}
            src={`${foto.src}${srcSet(foto.src) ? "&w=1920" : ""}`}
            srcSet={srcSet(foto.src)}
            sizes="100vw"
            alt={shown ? foto.alt : ""}
            aria-hidden={!shown}
            fetchPriority={i === 0 ? "high" : "low"}
            onLoad={i === 0 ? () => setFirstLoaded(true) : undefined}
            className={`hero-foto absolute inset-0 h-full w-full object-cover ${shown ? "is-active" : ""} ${
              shown || i === previous ? "is-drifting" : ""
            }`}
            style={{ objectPosition: foto.foco ?? "50% 50%" }}
          />
        );
      })}

      <div aria-hidden className="absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-background/70 to-transparent" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 z-10 h-3/4 bg-gradient-to-t from-background via-background/60 to-transparent" />

      {!prefersReducedMotion() && <ApertureIntro ready={firstLoaded} onOpen={() => setOpen(true)} />}

      <div className="relative z-30 mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8 sm:pb-16">
        <h1
          ref={wordmarkRef}
          className="iris-wordmark hero-reveal -ml-[0.04em] text-[clamp(3.5rem,15vw,13rem)] leading-[0.9] tracking-[-0.02em]"
        >
          {siteConfig.nombre}
        </h1>

        <div className="hero-reveal mt-8 flex flex-col gap-8 [transition-delay:150ms] sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-lg leading-relaxed text-foreground/85">{siteConfig.descripcion}</p>

          <div className="flex flex-wrap gap-3">
            <a
              href={cotizarHref()}
              target={whatsapp ? "_blank" : undefined}
              rel={whatsapp ? "noopener" : undefined}
              className="inline-flex h-12 items-center rounded-full bg-foreground px-6 font-medium text-background transition-colors hover:bg-foreground/85"
            >
              {whatsapp ? "Cotizar por WhatsApp" : "Pedir cotización"}
            </a>
            <a
              href="#trabajo"
              className="inline-flex h-12 items-center rounded-full border border-foreground/30 px-6 font-medium text-foreground transition-colors hover:bg-foreground/10"
            >
              Ver fotos
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
