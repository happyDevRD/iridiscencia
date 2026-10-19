import siteConfig from "@/content/site.json";

const { contacto } = siteConfig;

const whatsappDigits = (contacto.whatsapp ?? "").replace(/\D/g, "");

/** Link a WhatsApp con mensaje prellenado, o null si el estudio aún no configuró el número. */
export function whatsappUrl(mensaje: string): string | null {
  if (!whatsappDigits) return null;
  return `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(mensaje)}`;
}

/** Enlace para llamar, o null si no hay teléfono. */
export function telefonoUrl(): string | null {
  const digitos = (contacto.telefono ?? "").replace(/[^\d+]/g, "");
  return digitos ? `tel:${digitos}` : null;
}

/** Búsqueda de la dirección del estudio en Google Maps. */
export function mapaUrl(): string | null {
  const dir = (contacto.direccion ?? "").trim();
  return dir ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Iridiscencia, ${dir}`)}` : null;
}

export function instagramUrl(): string | null {
  const handle = (contacto.instagram ?? "").trim().replace(/^@/, "");
  if (!handle) return null;
  return handle.startsWith("http") ? handle : `https://instagram.com/${handle}`;
}

/** Destino del CTA principal: WhatsApp si existe, si no el formulario. */
export function cotizarHref(mensaje = "Hola, quiero cotizar una sesión con Iridiscencia."): string {
  return whatsappUrl(mensaje) ?? "#contacto";
}

/** Preselecciona un tipo de evento en el formulario de contacto. */
export const COTIZAR_EVENT = "iridiscencia:cotizar";
