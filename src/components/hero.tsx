import { useMemo, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import siteConfig from "@/content/site.json";
import { cotizarHref, whatsappUrl } from "@/lib/contact";
import { useGaleria } from "@/lib/gallery";
import { conRelleno, fotosDeGaleria } from "@/lib/fotos";
import { FadeUp, RevealText } from "@/components/motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const SERVICIOS = ["Bodas", "XV años", "Maternidad", "Graduaciones", "Retratos", "Cumpleaños", "Eventos"];

export function Hero() {
  const manifest = useGaleria();
  const fotos = useMemo(() => (manifest === undefined ? [] : conRelleno(fotosDeGaleria(manifest), 3)), [manifest]);
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Cada foto del collage se desplaza a su ritmo al hacer scroll.
  const yGrande = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const yMediana = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -160]);
  const yPequena = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -260]);
  const whatsapp = whatsappUrl("Hola, quiero cotizar una sesión con Iridiscencia.");

  const capas = [
    { foto: fotos[0], y: yGrande, className: "right-0 top-0 w-[68%] aspect-[4/5]", delay: 0.15 },
    { foto: fotos[1], y: yMediana, className: "bottom-0 left-0 w-[46%] aspect-[3/4]", delay: 0.35 },
    { foto: fotos[2], y: yPequena, className: "left-[12%] top-[6%] w-[28%] aspect-square", delay: 0.55 },
  ];

  return (
    <section ref={ref} id="inicio" className="relative overflow-hidden pt-28 sm:pt-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-6">
          <FadeUp>
            <p className="antetitulo text-muted-foreground">Estudio de fotografía · {siteConfig.ubicacion}</p>
          </FadeUp>
          <RevealText
            as="h1"
            text="Fotografía que captura lo irrepetible"
            italic={[4]}
            delay={0.1}
            className="mt-6 text-[clamp(3rem,6.6vw,6.25rem)] leading-[0.98]"
          />
          <FadeUp delay={0.5}>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground">
              Bodas, XV años, maternidad, graduaciones y retratos. En nuestro estudio o donde sea tu celebración.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={cotizarHref()}
                target={whatsapp ? "_blank" : undefined}
                rel={whatsapp ? "noopener" : undefined}
                className="group inline-flex h-13 items-center gap-2 rounded-full bg-foreground pl-7 pr-5 font-medium text-background transition-colors hover:bg-foreground/85"
              >
                {whatsapp ? "Cotizar por WhatsApp" : "Pedir cotización"}
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </a>
              <a
                href="#trabajo"
                className="inline-flex h-13 items-center rounded-full border border-foreground/15 px-7 font-medium transition-colors hover:border-foreground"
              >
                Ver el trabajo
              </a>
            </div>
          </FadeUp>
        </div>

        <div className="relative mx-auto aspect-[10/11] w-full max-w-xl lg:col-span-6 lg:max-w-none">
          {capas.map(
            ({ foto, y, className, delay }, i) =>
              foto && (
                <motion.div key={foto.src} style={{ y }} className={`absolute ${className} ${i === 2 ? "hidden sm:block" : ""}`}>
                  <motion.div
                    className="h-full w-full overflow-hidden rounded-xl shadow-[0_30px_60px_-30px_rgb(0_0_0/0.35)]"
                    initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0% round 22px)" }}
                    animate={{ clipPath: "inset(0% 0% 0% 0% round 22px)" }}
                    transition={{ duration: 1.2, ease: EASE, delay }}
                  >
                    <motion.img
                      src={i === 0 ? foto.src : foto.thumb}
                      alt={i === 0 ? foto.alt : ""}
                      fetchPriority={i === 0 ? "high" : "auto"}
                      className="h-full w-full object-cover"
                      initial={reduce ? false : { scale: 1.25 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 1.8, ease: EASE, delay }}
                    />
                  </motion.div>
                </motion.div>
              )
          )}
        </div>
      </div>

      <div className="mt-20 overflow-hidden border-y border-border py-6 sm:mt-28" aria-hidden>
        <div className="marquee flex w-max">
          {[0, 1].map((copia) => (
            <div key={copia} className="flex shrink-0 items-center">
              {SERVICIOS.map((s) => (
                <span key={s} className="flex items-center font-display text-4xl italic sm:text-5xl">
                  <span className="px-8">{s}</span>
                  <span className="size-1.5 rounded-full bg-foreground/30" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
