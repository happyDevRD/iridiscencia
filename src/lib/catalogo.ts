// Catálogo público que exporta ProStock (sistema de ventas del estudio) cada
// 5 minutos al NAS. Ver docs/prostock-catalogo.md.

export type CatalogoProducto = {
  sku: string;
  nombre: string;
  descripcion: string;
  incluye: string[];
  /** Precio final al cliente, ITBIS incluido, con la promoción vigente aplicada. */
  precio: number;
  precioRegular: number;
  enPromocion: boolean;
  icono: string | null;
};

export type CatalogoCategoria = {
  id: string;
  nombre: string;
  productos: CatalogoProducto[];
};

export type Catalogo = {
  generado: string;
  moneda: string;
  preciosIncluyenItbis: boolean;
  categorias: CatalogoCategoria[];
};

// Mismo host que la galería: hoy el sitio en el NAS (relativo), luego
// galeria.iridiscencia.com cuando el sitio pase a Cloudflare Pages.
const BASE_URL = (import.meta.env.VITE_GALLERY_BASE_URL ?? "").replace(/\/$/, "");

export async function fetchCatalogo(): Promise<Catalogo | null> {
  try {
    const res = await fetch(`${BASE_URL}/catalogo/catalogo.json`, { cache: "no-store" });
    if (!res.ok) throw new Error(`catalogo fetch failed: ${res.status}`);
    return (await res.json()) as Catalogo;
  } catch {
    return null;
  }
}

/** Productos cuyo SKU empieza por alguno de los prefijos, ordenados por precio. */
export function productosPorPrefijo(catalogo: Catalogo | null, prefijos: string[]): CatalogoProducto[] {
  if (!catalogo || prefijos.length === 0) return [];
  const upper = prefijos.map((p) => p.trim().toUpperCase()).filter(Boolean);
  return catalogo.categorias
    .flatMap((c) => c.productos)
    .filter((p) => upper.some((pre) => p.sku.toUpperCase().startsWith(pre)))
    .sort((a, b) => a.precio - b.precio);
}

const rd = new Intl.NumberFormat("es-DO", { maximumFractionDigits: 0 });

export function formatoPrecio(valor: number): string {
  return `RD$ ${rd.format(valor)}`;
}
