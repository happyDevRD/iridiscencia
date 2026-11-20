/**
 * Cliente del portal de selección. El nginx del sitio reenvía /api/seleccion/ → ProStock
 * (/api/public/selection/). Se entra con el enlace directo del WhatsApp (/seleccion/k_…) o con
 * usuario + contraseña; el servidor deja la sesión (12 h) en una cookie HttpOnly y las llamadas
 * van a /api/seleccion/me/… sin la sesión en la URL. Un 401 significa que la sesión ya no sirve.
 */

export type ExtraStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

export type Selection = {
  studio: string;
  title: string;
  customerFirstName?: string | null;
  quota: number;
  /** null = el estudio no vende fotos adicionales: no se puede pasar del cupo. */
  extraUnitPrice?: number | null;
  photos: string[];
  /** En el orden en que el cliente las marcó: las primeras `quota` son del paquete. */
  selected: string[];
  submitted: boolean;
  expiresAt: string;
  extraFiles?: string[];
  extraStatus?: ExtraStatus;
};

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const BASE = "/api/seleccion";
const NETWORK = "No se pudo conectar con el estudio. Revisa tu conexión e intenta de nuevo.";

function fallback(status: number): string {
  if (status === 401) return "Usuario o contraseña incorrectos.";
  if (status === 429) return "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.";
  if (status === 410) return "Este acceso ya venció. Escríbenos y te ayudamos.";
  return NETWORK;
}

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    });
  } catch {
    throw new ApiError(0, NETWORK);
  }
  if (!res.ok) {
    let message = "";
    try {
      const body = await res.json();
      if (typeof body?.message === "string") message = body.message;
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    throw new ApiError(res.status, message || fallback(res.status));
  }
  return res.json() as Promise<T>;
}

type LoginResult = { username: string };

export const login = (username: string, password: string) =>
  call<LoginResult>(`${BASE}/login`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

/** Entra con la llave del enlace directo (k_…); el servidor deja la cookie de sesión. */
export async function accessWithKey(key: string): Promise<LoginResult> {
  try {
    return await call<LoginResult>(`${BASE}/acceso`, { method: "POST", body: JSON.stringify({ key }) });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401 && e.message === fallback(401)) {
      throw new ApiError(401, "Este enlace no es válido. Entra con tu usuario y contraseña.");
    }
    throw e;
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${BASE}/logout`, { method: "POST" });
  } catch {
    /* sin red: la cookie vence sola */
  }
}

export function selectionApi() {
  const base = `${BASE}/me`;
  return {
    get: () => call<Selection>(base),
    save: (selected: string[], keepalive = false) =>
      call<Selection>(`${base}/selected`, { method: "PUT", body: JSON.stringify({ selected }), keepalive }),
    submit: (selected: string[], acceptExtra: boolean) =>
      call<Selection>(`${base}/submit`, { method: "POST", body: JSON.stringify({ selected, acceptExtra }) }),
    photoUrl: (name: string, size: "thumb" | "view") => `${base}/photos/${encodeURIComponent(name)}?size=${size}`,
  };
}

function pathSegment(): string {
  const raw = window.location.pathname.replace(/^\/seleccion\/?/, "").split("/")[0] ?? "";
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}

/** Llave del enlace directo que viene en la ruta: /seleccion/k_<id>_<firma>. */
export function keyFromPath(): string {
  const seg = pathSegment();
  return seg.startsWith("k_") ? seg : "";
}

/** Usuario que viene en la ruta: /seleccion/<usuario> (no la llave del enlace directo). */
export function usernameFromPath(): string {
  const seg = pathSegment();
  return seg.startsWith("k_") ? "" : seg;
}

export const money = (n: number) =>
  `RD$${n.toLocaleString("es-DO", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
