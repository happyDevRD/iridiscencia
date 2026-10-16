export type GalleryPhoto = {
  /** Versión de ~2400 px para el visor y la portada. */
  src: string;
  /** Versión de ~1100 px para la cuadrícula. */
  thumb: string;
  /** Tamaño de `thumb`, para reservar el espacio antes de que cargue. */
  w?: number;
  h?: number;
};

export type GalleryCategory = {
  id: string;
  nombre: string;
  fotos: GalleryPhoto[];
};

export type GalleryManifest = {
  /** Fotos de la carpeta "00 Portada" del NAS: reemplazan a las del Hero. */
  portada: GalleryPhoto[];
  categorias: GalleryCategory[];
};

const GALLERY_BASE_URL = (import.meta.env.VITE_GALLERY_BASE_URL ?? "").replace(/\/$/, "");

function absolute(foto: GalleryPhoto): GalleryPhoto {
  return { ...foto, src: `${GALLERY_BASE_URL}${foto.src}`, thumb: `${GALLERY_BASE_URL}${foto.thumb}` };
}

async function load(): Promise<GalleryManifest | null> {
  try {
    const res = await fetch(`${GALLERY_BASE_URL}/galeria/manifest.json`, { cache: "no-cache" });
    if (!res.ok) throw new Error(`gallery fetch failed: ${res.status}`);
    const data = (await res.json()) as Partial<GalleryManifest>;
    return {
      portada: (data.portada ?? []).map(absolute),
      categorias: (data.categorias ?? []).map((c) => ({ ...c, fotos: c.fotos.map(absolute) })),
    };
  } catch {
    // Solo en dev: sin NAS conectado localmente, muestra fotos de demo para
    // poder diseñar/revisar el layout. Nunca ocurre en producción — si la
    // galería real falla ahí, se mantiene el mensaje honesto de "próximamente".
    if (import.meta.env.DEV) {
      const { demoGalleryManifest } = await import("@/content/demo-gallery");
      return demoGalleryManifest;
    }
    return null;
  }
}

let pending: Promise<GalleryManifest | null> | null = null;

/** Lo usan el Hero y la galería: una sola petición por visita. */
export function fetchGalleryManifest(): Promise<GalleryManifest | null> {
  pending ??= load();
  return pending;
}
