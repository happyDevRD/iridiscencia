import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", import.meta.env.VITE_WEB3FORMS_KEY ?? "");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setStatus("sent");
        e.currentTarget.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p className="rounded-xl border border-border bg-card p-6 text-center text-foreground">
        ¡Gracias! Recibimos tu mensaje y te contactaremos pronto.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="nombre" type="text" placeholder="Nombre" required />
      <Input name="email" type="email" placeholder="Correo electrónico" required />
      <Textarea
        name="mensaje"
        placeholder="Cuéntanos sobre tu sesión (tipo de evento, fecha, etc.)"
        rows={5}
        required
      />
      <Button type="submit" size="lg" disabled={status === "sending"} className="w-full">
        {status === "sending" ? "Enviando…" : "Enviar mensaje"}
      </Button>
      {status === "error" && (
        <p className="text-sm text-destructive">
          Hubo un problema enviando el mensaje. Intenta de nuevo o escríbenos directo por correo.
        </p>
      )}
    </form>
  );
}
