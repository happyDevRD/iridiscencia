import { useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ProyectosDestacados } from "@/components/proyectos-destacados";
import { Paquetes } from "@/components/paquetes";
import { ContactoFooter } from "@/components/contacto-footer";

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

export default function App() {
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
        <ProyectosDestacados />
        <Paquetes />
      </main>
      <ContactoFooter />
    </>
  );
}
