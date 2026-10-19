import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useGaleria } from "@/lib/gallery";
import { conRelleno, fotosDeGaleria, intercalar, type Foto } from "@/lib/fotos";

/** Hasta `n` fotos del NAS mezcladas por categoría; [] mientras carga el manifiesto. */
export function useFotosHero(n: number): Foto[] {
  const manifest = useGaleria();
  return useMemo(() => (manifest === undefined ? [] : conRelleno(intercalar(fotosDeGaleria(manifest)), n)), [manifest, n]);
}

// ── Tono del hero: el navbar se vuelve blanco sobre un hero oscuro ─────────────

let tono: "claro" | "oscuro" = "claro";
const oyentes = new Set<() => void>();

/** Lo llama cada hero al montarse: avisa si va sobre fondo oscuro. */
export function useTonoHero(t: "claro" | "oscuro") {
  useEffect(() => {
    tono = t;
    oyentes.forEach((f) => f());
    return () => {
      tono = "claro";
      oyentes.forEach((f) => f());
    };
  }, [t]);
}

export function useHeroOscuro(): boolean {
  return useSyncExternalStore(
    (f) => {
      oyentes.add(f);
      return () => oyentes.delete(f);
    },
    () => tono === "oscuro"
  );
}
