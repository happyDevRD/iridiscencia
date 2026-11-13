import navidad from "@/content/navidad.json";
import { formatoPrecio } from "@/lib/catalogo";

export type PaqueteNavidad = (typeof navidad.paquetes)[number];

/** El especial se ve mientras esté activo y no haya pasado `hasta` (inclusive). */
export const NAVIDAD_ACTIVA = (() => {
  if (!navidad.activa) return false;
  if (!navidad.hasta) return true;
  return new Date() <= new Date(`${navidad.hasta}T23:59:59`);
})();

/**
 * Nombre con el que el paquete aparece en el formulario y llega a ProStock como tipo de
 * evento: empieza siempre por «Navidad» para poder contar las reservas del especial.
 */
export const tipoNavidad = (p: PaqueteNavidad) => `Navidad · ${p.nombre}`;

export const TIPOS_NAVIDAD = NAVIDAD_ACTIVA ? navidad.paquetes.map(tipoNavidad) : [];

export function paqueteNavidadDe(tipo: string): PaqueteNavidad | undefined {
  return navidad.paquetes.find((p) => tipoNavidad(p) === tipo);
}

export const cuposRestantes = () => Math.max(0, Math.min(navidad.oferta.cupos, navidad.oferta.cuposRestantes));

/** «15 % de descuento» o, mientras no se defina el monto, un texto genérico. */
export function textoDescuento(): string {
  const d = navidad.oferta.descuento.trim();
  return d ? `${d} de descuento` : "un descuento especial";
}

export const precio = (n: number) => formatoPrecio(n);

/** Precio con el descuento de la oferta si es un porcentaje («10 %»); null si no hay. */
export function precioConDescuento(n: number): number | null {
  const m = navidad.oferta.descuento.match(/(\d+(?:[.,]\d+)?)\s*%/);
  if (!m) return null;
  return Math.round((n * (100 - Number(m[1].replace(",", ".")))) / 100);
}

export { navidad };
