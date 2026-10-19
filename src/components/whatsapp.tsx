import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { whatsappUrl } from "@/lib/contact";
import { cn } from "@/lib/utils";

/** Logo de WhatsApp (Bootstrap Icons, MIT). */
export function IconoWhatsapp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={cn("size-4 shrink-0", className)}>
      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
    </svg>
  );
}

/**
 * Botón flotante de WhatsApp: aparece al dejar atrás el hero y se oculta en Contacto,
 * donde ya están el formulario y los canales. La primera vez muestra una invitación.
 */
export function BotonWhatsapp() {
  const url = whatsappUrl("Hola, vi su página y quiero cotizar una sesión con Iridiscencia.");
  const { scrollY } = useScroll();
  const [pasoHero, setPasoHero] = useState(false);
  const [enContacto, setEnContacto] = useState(false);
  const [invitacion, setInvitacion] = useState<"pendiente" | "visible" | "vista">("pendiente");

  useMotionValueEvent(scrollY, "change", (y) => {
    setPasoHero(y > (document.getElementById("inicio")?.offsetHeight ?? 600) * 0.8);
  });

  useEffect(() => {
    const contacto = document.getElementById("contacto");
    if (!contacto) return;
    const observer = new IntersectionObserver(([e]) => setEnContacto(e.isIntersecting), { threshold: 0.15 });
    observer.observe(contacto);
    return () => observer.disconnect();
  }, []);

  const visible = Boolean(url) && pasoHero && !enContacto;

  // La invitación sale una sola vez, poco después de aparecer el botón
  useEffect(() => {
    if (!visible || invitacion !== "pendiente") return;
    const mostrar = window.setTimeout(() => setInvitacion("visible"), 1200);
    return () => window.clearTimeout(mostrar);
  }, [visible, invitacion]);
  useEffect(() => {
    if (invitacion !== "visible") return;
    const ocultar = window.setTimeout(() => setInvitacion("vista"), 6000);
    return () => window.clearTimeout(ocultar);
  }, [invitacion]);

  if (!url) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className="fixed bottom-5 right-5 z-30 flex items-center gap-3 sm:bottom-7 sm:right-7"
        >
          <AnimatePresence>
            {invitacion === "visible" && (
              <motion.a
                href={url}
                target="_blank"
                rel="noopener"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl rounded-br-sm bg-background px-4 py-3 text-sm shadow-[0_12px_40px_-12px_rgb(0_0_0/0.35)]"
              >
                <span className="block font-medium">¿Cotizamos tu sesión?</span>
                <span className="text-muted-foreground">Te respondemos por WhatsApp</span>
              </motion.a>
            )}
          </AnimatePresence>
          <a
            href={url}
            target="_blank"
            rel="noopener"
            aria-label="Escribir por WhatsApp"
            className="group relative grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_32px_-8px_rgb(37_211_102/0.6)] transition-transform duration-300 hover:scale-105"
          >
            {/* Pulso suave para llamar la atención sin molestar */}
            <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20 [animation-duration:2.4s]" />
            <IconoWhatsapp className="relative size-7" />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
