"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "");

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
      <p className="text-center text-white/80">
        ¡Gracias! Recibimos tu mensaje y te contactaremos pronto.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="nombre"
        type="text"
        placeholder="Nombre"
        required
        className="w-full border border-white/20 bg-transparent px-4 py-3 text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none"
      />
      <input
        name="email"
        type="email"
        placeholder="Correo electrónico"
        required
        className="w-full border border-white/20 bg-transparent px-4 py-3 text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none"
      />
      <textarea
        name="mensaje"
        placeholder="Cuéntanos sobre tu sesión (tipo de evento, fecha, etc.)"
        rows={5}
        required
        className="w-full border border-white/20 bg-transparent px-4 py-3 text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none"
      />
      <Button type="submit" size="lg" disabled={status === "sending"} className="w-full">
        {status === "sending" ? "Enviando…" : "Enviar mensaje"}
      </Button>
      {status === "error" && (
        <p className="text-sm text-red-400">
          Hubo un problema enviando el mensaje. Intenta de nuevo o escríbenos directo por correo.
        </p>
      )}
    </form>
  );
}
