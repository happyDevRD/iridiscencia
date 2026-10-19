import { useEffect } from "react";
import Lenis from "lenis";
import { paradasDeScroll } from "@/lib/paradas";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ProyectosDestacados } from "@/components/proyectos-destacados";
import { Paquetes } from "@/components/paquetes";
import { Proceso } from "@/components/proceso";
import { ZoomParallax } from "@/components/zoom-parallax";
import { ContactoFooter } from "@/components/contacto-footer";
import { BotonWhatsapp } from "@/components/whatsapp";

/** React pinta después de que el navegador busca el ancla: enlaces como /#paquetes deben bajar igual. */
function useInitialHashScroll() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    // Galería y paquetes cargan datos y cambian de alto: se reintenta un momento.
    const timers = [100, 900, 2000].map((ms) =>
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "instant" }), ms)
    );
    const cancel = () => timers.forEach(window.clearTimeout);
    window.addEventListener("wheel", cancel, { once: true });
    window.addEventListener("touchstart", cancel, { once: true });
    return () => {
      cancel();
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
    };
  }, []);
}

/**
 * Scroll con inercia, como en las webs de agencia, y paradas suaves en las secciones
 * (ver `lib/paradas.ts`); se desactiva con reduced motion. Los enlaces del menú llegan
 * justo al inicio de cada sección, que ya deja sitio al menú con su propio margen.
 */
function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, anchors: true });
    const quitarParadas = paradasDeScroll(lenis);
    return () => {
      quitarParadas();
      lenis.destroy();
    };
  }, []);
}

export default function App() {
  useSmoothScroll();
  useInitialHashScroll();
  return (
    <>
      <a
        href="#trabajo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main>
        <Hero />
        <ZoomParallax />
        <ProyectosDestacados />
        <Paquetes />
        <Proceso />
      </main>
      <ContactoFooter />
      <BotonWhatsapp />
    </>
  );
}
