import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ProyectosDestacados } from "@/components/proyectos-destacados";
import { Paquetes } from "@/components/paquetes";
import { ContactoFooter } from "@/components/contacto-footer";

export default function App() {
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
