import { motion } from "motion/react";
import siteConfig from "@/content/site.json";
import { HERO_VIDEO_URL, HERO_VIDEO_LOOP_START, HERO_VIDEO_LOOP_END } from "@/components/hero";
import { ContactForm } from "@/components/contact-form";
import { useVideoLoopWindow } from "@/hooks/use-video-loop-window";

const MARQUEE_TEXT = "FOTOGRAFÍA DE BODAS • XV AÑOS • EVENTOS CORPORATIVOS • RETRATOS •";

export function ContactoFooter() {
  const videoRef = useVideoLoopWindow(HERO_VIDEO_LOOP_START, HERO_VIDEO_LOOP_END);

  return (
    <footer id="contacto" className="relative overflow-hidden border-t border-border">
      <video
        ref={videoRef}
        src={HERO_VIDEO_URL}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 h-full w-full scale-y-[-1] object-cover opacity-20"
      />
      <div className="absolute inset-0 bg-background/85" />

      <div className="relative z-10 border-b border-border py-4">
        <div className="animate-marquee flex whitespace-nowrap text-sm tracking-[0.2em] text-muted-foreground">
          <span className="px-4">{MARQUEE_TEXT.repeat(4)}</span>
          <span className="px-4">{MARQUEE_TEXT.repeat(4)}</span>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">Contacto</p>
        <h2 className="mt-3 font-display text-4xl italic text-foreground sm:text-5xl">Hablemos</h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Escríbenos para cotizar tu sesión y contarnos sobre tu evento.
        </p>

        <motion.a
          href={`mailto:${siteConfig.contacto.email}`}
          whileHover={{ scale: 1.08 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="accent-gradient mx-auto mt-10 flex size-32 items-center justify-center rounded-full text-lg font-medium text-background"
        >
          Escribir
        </motion.a>

        <div className="mx-auto mt-16 max-w-md text-left">
          <ContactForm />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-2 border-t border-border py-8 text-xs text-muted-foreground">
        <p className="flex items-center gap-2">
          <span className="animate-blink size-2 rounded-full bg-green-500" />
          Agenda abierta para proyectos
        </p>
        <p>
          © {new Date().getFullYear()} {siteConfig.nombre}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
