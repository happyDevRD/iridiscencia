import { HeroMuro } from "@/components/heroes/hero-muro";
import { CintaServicios } from "@/components/heroes/compartido";

/** El hero de siempre; en temporada (`content/navidad.json`) lleva además un aviso del especial. */
export function Hero() {
  return (
    <>
      <HeroMuro />
      <CintaServicios />
    </>
  );
}
