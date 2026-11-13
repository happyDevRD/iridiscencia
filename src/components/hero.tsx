import { HeroMuro } from "@/components/heroes/hero-muro";
import { HeroNavidad } from "@/components/heroes/hero-navidad";
import { CintaServicios } from "@/components/heroes/compartido";
import { NAVIDAD_ACTIVA } from "@/lib/navidad";

export function Hero() {
  return (
    <>
      {NAVIDAD_ACTIVA ? <HeroNavidad /> : <HeroMuro />}
      <CintaServicios />
    </>
  );
}
