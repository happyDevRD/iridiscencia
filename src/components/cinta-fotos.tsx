import { useMemo } from "react";
import { useGaleria } from "@/lib/gallery";
import { conRelleno, fotosDeGaleria, intercalar, type Foto } from "@/lib/fotos";
import { FadeUp, RevealText } from "@/components/motion";

const POR_FILA = 9;

/**
 * Dos cintas de fotos que avanzan solas en sentidos opuestos. Sección de altura normal:
 * no fija el scroll, así que en el teléfono se baja como cualquier otra parte de la página.
 */
export function CintaFotos() {
  const manifest = useGaleria();
  const filas = useMemo(() => {
    if (manifest === undefined) return null;
    const fotos = conRelleno(intercalar(fotosDeGaleria(manifest).filter((f) => f.categoria !== "Portada")), POR_FILA * 2);
    return [fotos.slice(0, POR_FILA), fotos.slice(POR_FILA)];
  }, [manifest]);

  if (!filas || filas[1].length < 4) return null;

  return (
    <section aria-label="Fotos destacadas" className="overflow-hidden pb-4 pt-20 sm:pb-8 sm:pt-28">
      <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
        <FadeUp>
          <p className="antetitulo text-muted-foreground">Sesiones reales del estudio</p>
        </FadeUp>
        <RevealText text="Cada historia, en grande" italic={[3]} className="mt-4 text-4xl leading-tight sm:text-6xl" />
      </div>
      <FadeUp delay={0.15}>
        <div className="mt-12 flex flex-col gap-3 sm:mt-16 sm:gap-4">
          <Fila fotos={filas[0]} />
          <Fila fotos={filas[1]} reversa />
        </div>
      </FadeUp>
    </section>
  );
}

function Fila({ fotos, reversa = false }: { fotos: Foto[]; reversa?: boolean }) {
  // La lista va dos veces seguidas: al llegar a la mitad, la cinta vuelve al inicio sin salto.
  return (
    <div className="flex w-max gap-3 sm:gap-4 marquee-fotos" style={{ animationDirection: reversa ? "reverse" : undefined }}>
      {[...fotos, ...fotos].map((f, i) => (
        <img
          key={i}
          src={f.thumb}
          alt={i < fotos.length ? f.alt : ""}
          aria-hidden={i >= fotos.length || undefined}
          loading="lazy"
          decoding="async"
          width={f.w}
          height={f.h}
          className="h-44 w-auto shrink-0 rounded-lg object-cover sm:h-72"
          style={{ aspectRatio: f.w && f.h ? `${f.w} / ${f.h}` : "4 / 5" }}
        />
      ))}
    </div>
  );
}
