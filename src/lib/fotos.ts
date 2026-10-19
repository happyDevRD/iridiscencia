import siteConfig from "@/content/site.json";
import paquetesData from "@/content/paquetes.json";
import type { GalleryManifest } from "@/lib/gallery";

export type Foto = {
  /** Versión grande (visor, fondos). */
  src: string;
  /** Versión para cuadrículas. */
  thumb: string;
  alt: string;
  categoria: string;
  w?: number;
  h?: number;
};

function unsplash(src: string, w: number) {
  if (!src.includes("images.unsplash.com")) return src;
  const url = new URL(src);
  url.searchParams.set("w", String(w));
  return url.toString();
}

/** Fotos de site.json y paquetes.json: solo rellenan mientras el NAS tiene pocas. */
const RELLENO: Foto[] = [
  ...siteConfig.heroFotos.map((f) => ({ src: unsplash(f.src, 2000), thumb: unsplash(f.src, 900), alt: f.alt, categoria: "Bodas" })),
  ...paquetesData.paquetes
    .filter((p) => p.imagen)
    .map((p) => ({ src: unsplash(p.imagen, 2000), thumb: unsplash(p.imagen, 900), alt: p.nombre, categoria: p.nombre })),
];

/** Todas las fotos del NAS, categoría por categoría (la portada va primero). */
export function fotosDeGaleria(manifest: GalleryManifest | null | undefined): Foto[] {
  if (!manifest) return [];
  const portada = manifest.portada.map((f) => ({ ...f, alt: `Fotografía de ${siteConfig.nombre}`, categoria: "Portada" }));
  const resto = manifest.categorias.flatMap((c) =>
    c.fotos.map((f, i) => ({ ...f, alt: `${c.nombre}, foto ${i + 1} — ${siteConfig.nombre}`, categoria: c.nombre }))
  );
  return [...portada, ...resto];
}

/** Al menos `n` fotos: las reales primero y, si faltan, las de relleno. */
export function conRelleno(fotos: Foto[], n: number): Foto[] {
  if (fotos.length >= n) return fotos.slice(0, n);
  const usadas = new Set(fotos.map((f) => f.src));
  return [...fotos, ...RELLENO.filter((f) => !usadas.has(f.src))].slice(0, n);
}

/** Alterna categorías (una foto de cada por vuelta) para que no salgan todas las bodas seguidas. */
export function intercalar<T extends { categoria: string }>(fotos: T[]): T[] {
  const grupos = new Map<string, T[]>();
  for (const f of fotos) grupos.set(f.categoria, [...(grupos.get(f.categoria) ?? []), f]);
  const out: T[] = [];
  for (let i = 0; out.length < fotos.length; i++) {
    for (const g of grupos.values()) if (g[i]) out.push(g[i]);
  }
  return out;
}
