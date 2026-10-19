import { useEffect, useId, useRef, useState } from "react";
import paquetesData from "@/content/paquetes.json";
import siteConfig from "@/content/site.json";
import { COTIZAR_EVENT, whatsappUrl } from "@/lib/contact";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IconoWhatsapp } from "@/components/whatsapp";

type Status = "idle" | "sending" | "sent" | "error";

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY ?? "";
/** Sin Web3Forms, la cotización sale por WhatsApp si el estudio tiene número. */
const POR_WHATSAPP = !WEB3FORMS_KEY && Boolean(whatsappUrl(""));

/**
 * Registra la solicitud en ProStock (bandeja "Solicitudes web" del estudio) y devuelve su
 * referencia (S-0012). Si ProStock no responde a tiempo, sigue sin ella: la reserva no se pierde
 * porque el mensaje igual sale por WhatsApp o correo.
 */
async function registrarSolicitud(data: FormData): Promise<string | null> {
  const campo = (k: string) => String(data.get(k) ?? "").trim();
  try {
    const res = await fetch("/api/solicitudes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        nombre: campo("nombre"),
        telefono: campo("telefono"),
        email: campo("email") || null,
        tipoEvento: campo("tipo_evento") || null,
        fecha: campo("fecha") || null,
        mensaje: campo("mensaje") || null,
        website: data.get("botcheck") ? "1" : null,
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { code?: string };
    return json.code ?? null;
  } catch {
    return null;
  }
}

/**
 * Sin Web3Forms configurado, la cotización sale redactada por WhatsApp o, en último caso, por correo.
 * `ventana` es la pestaña abierta durante el clic (si se abriera después de esperar a ProStock,
 * el navegador la bloquearía).
 */
function enviarSinBackend(data: FormData, referencia: string | null, ventana: Window | null): void {
  const campo = (k: string) => String(data.get(k) ?? "").trim();
  const texto = [
    `Hola, soy ${campo("nombre")}. Quiero cotizar: ${campo("tipo_evento")}.`,
    campo("fecha") && `Fecha: ${campo("fecha")}.`,
    campo("mensaje"),
    `Mi teléfono: ${campo("telefono")}${campo("email") ? ` · ${campo("email")}` : ""}`,
    referencia && `Solicitud ${referencia}`,
  ]
    .filter(Boolean)
    .join("\n");

  const whatsapp = whatsappUrl(texto);
  if (whatsapp) {
    if (ventana) ventana.location.href = whatsapp;
    else window.location.href = whatsapp;
  } else {
    ventana?.close();
    const asunto = `Cotización: ${campo("tipo_evento")}${referencia ? ` (${referencia})` : ""}`;
    window.location.href = `mailto:${siteConfig.contacto.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(texto)}`;
  }
}

const VARIAS = "Varias sesiones";
const TIPOS = [...paquetesData.paquetes.map((p) => p.nombre), VARIAS, "Otro"];

function Field({ label, hint, children }: { label: string; hint?: string; children: (id: string) => React.ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
        {hint && <span className="text-muted-foreground"> ({hint})</span>}
      </label>
      {children(id)}
    </div>
  );
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [tipo, setTipo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // La hoja de pedido, sin WhatsApp configurado, trae aquí las sesiones marcadas.
  useEffect(() => {
    function handleCotizar(e: Event) {
      const nombres = (e as CustomEvent<string[]>).detail;
      setTipo(nombres.length === 1 ? nombres[0] : VARIAS);
      if (nombres.length > 1) setMensaje(`Me interesan: ${nombres.join(", ")}.`);
    }
    window.addEventListener(COTIZAR_EVENT, handleCotizar);
    return () => window.removeEventListener(COTIZAR_EVENT, handleCotizar);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");

    const formData = new FormData(form);
    if (!WEB3FORMS_KEY) {
      const ventana = whatsappUrl("") ? window.open("", "_blank") : null;
      if (ventana) ventana.opener = null;
      enviarSinBackend(formData, await registrarSolicitud(formData), ventana);
      form.reset();
      setTipo("");
      setMensaje("");
      setStatus("sent");
      return;
    }
    const referencia = await registrarSolicitud(formData);
    formData.append("access_key", WEB3FORMS_KEY);
    formData.append(
      "subject",
      `Nueva cotización (${formData.get("tipo_evento") || "sin tipo"})${referencia ? ` ${referencia}` : ""} — ${siteConfig.nombre}`,
    );
    formData.append("from_name", "Web de Iridiscencia");

    try {
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      form.reset();
      setTipo("");
      setMensaje("");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="border-t border-border pt-8" role="status">
        <p className="font-display text-4xl">{WEB3FORMS_KEY ? "Mensaje enviado." : "Ya casi."}</p>
        <p className="mt-3 text-muted-foreground">
          {WEB3FORMS_KEY
            ? "Te escribimos al número que dejaste con la cotización."
            : "Abrimos tu mensaje ya redactado: solo falta pulsar enviar. Te respondemos con la cotización."}
        </p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-6 text-sm underline underline-offset-4">
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre">{(id) => <Input id={id} name="nombre" autoComplete="name" required />}</Field>
        <Field label="WhatsApp o teléfono">
          {(id) => <Input id={id} name="telefono" type="tel" autoComplete="tel" inputMode="tel" required />}
        </Field>
      </div>

      <Field label="Correo" hint="opcional">
        {(id) => <Input id={id} name="email" type="email" autoComplete="email" />}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Tipo de evento">
          {(id) => (
            <select
              id={id}
              name="tipo_evento"
              required
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="flex h-12 w-full rounded-lg border border-transparent bg-card px-4 text-base text-foreground outline-none focus-visible:border-ring"
            >
              <option value="" disabled>
                Elige uno
              </option>
              {TIPOS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Fecha del evento" hint="si ya la tienes">
          {(id) => <Input id={id} name="fecha" type="date"  />}
        </Field>
      </div>

      <Field label="Cuéntanos del evento" hint="lugar, cantidad de horas, ideas">
        {(id) => <Textarea id={id} name="mensaje" rows={4} value={mensaje} onChange={(e) => setMensaje(e.target.value)} />}
      </Field>

      <button
        type="submit"
        disabled={status === "sending"}
        className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:opacity-60 ${
          POR_WHATSAPP ? "bg-[#25D366] text-tinta hover:bg-[#1fb857]" : "bg-foreground text-background hover:bg-foreground/85"
        }`}
      >
        {POR_WHATSAPP && <IconoWhatsapp className="size-5" />}
        {status === "sending" ? "Enviando…" : POR_WHATSAPP ? "Enviar por WhatsApp" : "Pedir cotización"}
      </button>
      {POR_WHATSAPP && (
        <p className="text-center text-sm text-muted-foreground">Se abre WhatsApp con tu mensaje ya escrito; solo tienes que enviarlo.</p>
      )}

      {status === "error" && (
        <p className="text-sm text-destructive" role="alert">
          No se pudo enviar el mensaje. Escríbenos directo a{" "}
          <a href={`mailto:${siteConfig.contacto.email}`} className="underline">
            {siteConfig.contacto.email}
          </a>
          .
        </p>
      )}
    </form>
  );
}
