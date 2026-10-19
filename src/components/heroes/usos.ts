import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useGaleria } from "@/lib/gallery";
import { conRelleno, fotosDeGaleria, type Foto } from "@/lib/fotos";

/** Alterna categorías (portada primero) para que se mezclen bodas, XV, retratos… */
function mezclar(fotos: Foto[]): Foto[] {
  const porCategoria = new Map<string, Foto[]>();
  for (const f of fotos) porCategoria.set(f.categoria, [...(porCategoria.get(f.categoria) ?? []), f]);
  const grupos = [...porCategoria.values()];
  const out: Foto[] = [];
  for (let i = 0; out.length < fotos.length; i++) {
    for (const g of grupos) if (g[i]) out.push(g[i]);
  }
  return out;
}

/** Hasta `n` fotos del NAS mezcladas por categoría; [] mientras carga el manifiesto. */
export function useFotosHero(n: number): Foto[] {
  const manifest = useGaleria();
  return useMemo(() => (manifest === undefined ? [] : conRelleno(mezclar(fotosDeGaleria(manifest)), n)), [manifest, n]);
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
