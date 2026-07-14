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

export async function fetchGalleryManifest(): Promise<GalleryManifest | null> {
  try {
    const res = await fetch("/galeria/manifest.json", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as GalleryManifest;
  } catch {
    return null;
  }
}
