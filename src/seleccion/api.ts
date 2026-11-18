/**
 * Cliente del portal de selección. El nginx del sitio reenvía /api/seleccion/ → ProStock
 * (/api/public/selection/). El cliente entra con usuario + contraseña y recibe una sesión
 * (12 h) que va en la ruta de cada llamada; un 401 significa que la sesión ya no sirve.
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

export const login = (username: string, password: string) =>
  call<{ session: string }>(`${BASE}/login`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export function selectionApi(session: string) {
  const base = `${BASE}/${encodeURIComponent(session)}`;
  return {
    get: () => call<Selection>(base),
    save: (selected: string[], keepalive = false) =>
      call<Selection>(`${base}/selected`, { method: "PUT", body: JSON.stringify({ selected }), keepalive }),
    submit: (selected: string[], acceptExtra: boolean) =>
      call<Selection>(`${base}/submit`, { method: "POST", body: JSON.stringify({ selected, acceptExtra }) }),
    photoUrl: (name: string, size: "thumb" | "view") => `${base}/photos/${encodeURIComponent(name)}?size=${size}`,
  };
}

/* ---------- Sesión guardada (sessionStorage; si no está disponible, funciona sin guardar) ---------- */

export type Auth = { session: string; username: string };
const KEY = "iridiscencia.seleccion";

export function loadAuth(): Auth | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return typeof v?.session === "string" && typeof v?.username === "string" ? v : null;
  } catch {
    return null;
  }
}

export function saveAuth(auth: Auth) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(auth));
  } catch {
    /* sin almacenamiento: la sesión dura lo que dure la pestaña */
  }
}

export function clearAuth() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* nada que borrar */
  }
}

/** Usuario que viene en la ruta: /seleccion/<usuario>. */
export function usernameFromPath(): string {
  const raw = window.location.pathname.replace(/^\/seleccion\/?/, "").split("/")[0] ?? "";
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}

export const money = (n: number) =>
  `RD$${n.toLocaleString("es-DO", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
