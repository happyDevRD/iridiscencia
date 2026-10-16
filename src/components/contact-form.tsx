import { useEffect, useId, useRef, useState } from "react";
import paquetesData from "@/content/paquetes.json";
import siteConfig from "@/content/site.json";
import { COTIZAR_EVENT, whatsappUrl } from "@/lib/contact";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Status = "idle" | "sending" | "sent" | "error";

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY ?? "";

/** Sin Web3Forms configurado, la cotización sale redactada por WhatsApp o, en último caso, por correo. */
function enviarSinBackend(data: FormData): void {
  const campo = (k: string) => String(data.get(k) ?? "").trim();
  const texto = [
    `Hola, soy ${campo("nombre")}. Quiero cotizar: ${campo("tipo_evento")}.`,
    campo("fecha") && `Fecha: ${campo("fecha")}.`,
    campo("mensaje"),
    `Mi teléfono: ${campo("telefono")}${campo("email") ? ` · ${campo("email")}` : ""}`,
  ]
    .filter(Boolean)
    .join("\n");

  const whatsapp = whatsappUrl(texto);
  if (whatsapp) {
    window.open(whatsapp, "_blank", "noopener");
  } else {
    const asunto = `Cotización: ${campo("tipo_evento")}`;
    window.location.href = `mailto:${siteConfig.contacto.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(texto)}`;
  }
}

const TIPOS = [...paquetesData.paquetes.map((p) => p.nombre), "Otro"];

function Field({ label, hint, children }: { label: string; hint?: string; children: (id: string) => React.ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-foreground/85">
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
  const formRef = useRef<HTMLFormElement>(null);

  // "Cotizar este paquete" sin WhatsApp configurado preselecciona el tipo aquí.
  useEffect(() => {
    function handleCotizar(e: Event) {
      setTipo((e as CustomEvent<string>).detail);
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
      enviarSinBackend(formData);
      form.reset();
      setTipo("");
      setStatus("sent");
      return;
    }
    formData.append("access_key", WEB3FORMS_KEY);
    formData.append("subject", `Nueva cotización (${formData.get("tipo_evento") || "sin tipo"}) — ${siteConfig.nombre}`);
    formData.append("from_name", "Web de Iridiscencia");

    try {
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      form.reset();
      setTipo("");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="border-t border-border pt-8" role="status">
        <p className="font-display text-3xl">{WEB3FORMS_KEY ? "Mensaje enviado." : "Ya casi."}</p>
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
              className="flex h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none focus-visible:border-ring"
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
          {(id) => <Input id={id} name="fecha" type="date" className="[color-scheme:dark]" />}
        </Field>
      </div>

      <Field label="Cuéntanos del evento" hint="lugar, cantidad de horas, ideas">
        {(id) => <Textarea id={id} name="mensaje" rows={4} />}
      </Field>

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-foreground font-medium text-background transition-colors hover:bg-foreground/85 disabled:opacity-60"
      >
        {status === "sending" ? "Enviando…" : "Pedir cotización"}
      </button>

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
