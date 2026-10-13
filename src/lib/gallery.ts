export type GalleryPhoto = {
  src: string;
  thumb: string;
};

export type GalleryCategory = {
  id: string;
  nombre: string;
  fotos: GalleryPhoto[];
};

export type GalleryManifest = {
  categorias: GalleryCategory[];
};

const GALLERY_BASE_URL = (import.meta.env.VITE_GALLERY_BASE_URL ?? "").replace(/\/$/, "");

function absolute(path: string): string {
  return `${GALLERY_BASE_URL}${path}`;
}

export async function fetchGalleryManifest(): Promise<GalleryManifest | null> {
  try {
    const res = await fetch(`${GALLERY_BASE_URL}/galeria/manifest.json`, { cache: "no-store" });
    if (!res.ok) throw new Error(`gallery fetch failed: ${res.status}`);
    const data = (await res.json()) as GalleryManifest;
    return {
      categorias: data.categorias.map((categoria) => ({
        ...categoria,
        fotos: categoria.fotos.map((foto) => ({
          src: absolute(foto.src),
          thumb: absolute(foto.thumb),
        })),
      })),
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
