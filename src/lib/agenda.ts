// Horarios libres para el formulario de reservas. ProStock da solo los tramos ocupados
// (citas, solicitudes pendientes y fechas bloqueadas, sin datos de nadie); aquí se arman
// los horarios que se ofrecen según la duración de cada paquete.
import paquetesData from "@/content/paquetes.json";
import siteConfig from "@/content/site.json";

export type Ocupado = { start: string; end: string };

/** Cómo se agenda un tipo de evento. null = no se pide hora (Varias sesiones, Otro). */
export type ReglaAgenda = { diaCompleto: true } | { diaCompleto: false; duracion: number; paso: number };

export function reglaDe(tipo: string): ReglaAgenda | null {
  const p = paquetesData.paquetes.find((x) => x.nombre === tipo);
  if (!p) return null;
  if (p.diaCompleto) return { diaCompleto: true };
  const duracion = p.duracionMinutos || 60;
  // Sesiones de media hora (o 1 h 30…) se ofrecen cada 30 min; las de horas completas, cada hora.
  return { diaCompleto: false, duracion, paso: duracion % 60 === 0 ? 60 : 30 };
}

const pad = (n: number) => String(n).padStart(2, "0");
export const diaKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const minutos = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
/** "YYYY-MM-DD[THH:mm]" como hora local. */
function local(valor: string): Date {
  const [d, t = "00:00"] = valor.split("T");
  const [y, mo, da] = d.split("-").map(Number);
  const [h, mi] = t.split(":").map(Number);
  return new Date(y, mo - 1, da, h || 0, mi || 0);
}

const { apertura, cierre, anticipacionHoras, diasMaximos } = siteConfig.agenda;

/** Fechas que acepta el selector. */
export function limitesFecha(ahora = new Date()): { min: string; max: string } {
  const min = new Date(ahora.getTime() + anticipacionHoras * 3_600_000);
  const max = new Date(ahora);
  max.setDate(max.getDate() + diasMaximos);
  return { min: diaKey(min), max: diaKey(max) };
}

export type Horario = { hora: string; etiqueta: string };

/** Horarios libres de un día (vacío si no queda ninguno). Para día completo, [] o un único "todo el día". */
export function horariosLibres(fecha: string, regla: ReglaAgenda, ocupados: Ocupado[], ahora = new Date()): Horario[] {
  const limite = ahora.getTime() + anticipacionHoras * 3_600_000;
  const choca = (ini: Date, fin: Date) =>
    ocupados.some((o) => local(o.start).getTime() < fin.getTime() && local(o.end).getTime() > ini.getTime());
  const dia = local(fecha);

  if (regla.diaCompleto) {
    const fin = new Date(dia);
    fin.setDate(fin.getDate() + 1);
    return fecha >= diaKey(new Date(limite)) && !choca(dia, fin) ? [{ hora: "", etiqueta: "Todo el día" }] : [];
  }

  const out: Horario[] = [];
  for (let m = minutos(apertura); m + regla.duracion <= minutos(cierre); m += regla.paso) {
    const ini = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), Math.floor(m / 60), m % 60);
    const fin = new Date(ini.getTime() + regla.duracion * 60_000);
    if (ini.getTime() < limite || choca(ini, fin)) continue;
    out.push({
      hora: `${pad(ini.getHours())}:${pad(ini.getMinutes())}`,
      etiqueta: ini.toLocaleTimeString("es-DO", { hour: "numeric", minute: "2-digit" }),
    });
  }
  return out;
}

/** Tramos ocupados del día. null si ProStock no responde: el formulario sigue sin pedir hora. */
export async function ocupadosDel(fecha: string): Promise<Ocupado[] | null> {
  try {
    const res = await fetch(`/api/disponibilidad?from=${fecha}&to=${fecha}`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const json = (await res.json()) as { busy?: Ocupado[] };
    return json.busy ?? [];
  } catch {
    return null;
  }
}
