import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { LoadingScreen } from "@/components/loading-screen";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ProyectosDestacados } from "@/components/proyectos-destacados";
import { EditorialBreak } from "@/components/editorial-break";
import { Paquetes } from "@/components/paquetes";
import { ContactoFooter } from "@/components/contacto-footer";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = loading ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [loading]);

  return (
    <>
      <AnimatePresence>{loading && <LoadingScreen onDone={() => setLoading(false)} />}</AnimatePresence>

      <Navbar />
      <main>
        <Hero active={!loading} />
        <ProyectosDestacados />
        <EditorialBreak />
        <Paquetes />
      </main>
      <ContactoFooter />
    </>
  );
}
