import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check, Gift } from "lucide-react";
import { COTIZAR_EVENT } from "@/lib/contact";
import { cuposRestantes, navidad, precio, precioConDescuento, textoDescuento, tipoNavidad, type PaqueteNavidad } from "@/lib/navidad";
import { Lightbox, type LightboxPhoto } from "@/components/lightbox";
import { FadeUp, RevealText } from "@/components/motion";
import { Cupos, Destellos } from "@/components/heroes/hero-navidad";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const FOTOS: LightboxPhoto[] = navidad.fotos.map((f) => ({ ...f, caption: "Set Navidad en casa" }));

/** Lleva al formulario con el paquete ya elegido (la oferta es solo para reservas por la web). */
function reservar(p: PaqueteNavidad) {
  window.dispatchEvent(new CustomEvent(COTIZAR_EVENT, { detail: [tipoNavidad(p)] }));
}

/**
 * Fotos del set. En el móvil, una tira que corre sola (sin tener que deslizar);
 * en escritorio, 4 columnas escalonadas que entran al bajar.
 */
function FotosSet({ onAbrir }: { onAbrir: (i: number) => void }) {
  const reduce = useReducedMotion();
  return (
    <>
      <div className="-mx-5 overflow-hidden sm:-mx-8 lg:hidden">
        <div className={cn("flex w-max gap-3 pl-3", !reduce && "tira-set")}>
          {[...FOTOS, ...FOTOS].map((f, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onAbrir(i % FOTOS.length)}
              className="aspect-[4/5] w-44 shrink-0 overflow-hidden rounded-xl bg-white/5 sm:w-56"
              aria-label={`Ver foto: ${f.alt}`}
              tabIndex={i < FOTOS.length ? 0 : -1}
              aria-hidden={i >= FOTOS.length}
            >
              <img src={f.src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="hidden grid-cols-4 gap-4 lg:grid">
        {FOTOS.map((f, i) => (
          <motion.button
            key={f.src}
            type="button"
            onClick={() => onAbrir(i)}
            className={cn("group relative aspect-[4/5] overflow-hidden rounded-xl bg-white/5", i % 2 === 1 && "translate-y-10")}
            initial={reduce ? false : { opacity: 0, y: 60, rotate: i % 2 ? 3 : -3 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 1, ease: EASE, delay: (i % 4) * 0.1 }}
            aria-label={`Ver foto: ${f.alt}`}
          >
            <img
              src={f.src}
              alt={f.alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-suave)] group-hover:scale-105"
            />
            <span className="reflejo pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
          </motion.button>
        ))}
      </div>
    </>
  );
}

function TarjetaPaquete({ p, conDescuento }: { p: PaqueteNavidad; conDescuento: boolean }) {
  const destacado = "destacado" in p && p.destacado;
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border p-7 transition-[transform,box-shadow] duration-500 ease-[var(--ease-suave)] hover:-translate-y-1.5 hover:shadow-[0_24px_60px_-20px_rgb(216_177_106/0.35)] sm:p-8",
        destacado ? "border-[var(--oro)]/60 bg-[var(--vino)]/25" : "border-white/15 bg-white/[0.03]"
      )}
    >
      {destacado && (
        <span className="antetitulo absolute -top-3 left-7 rounded-full bg-[var(--oro)] px-3 py-1 text-[0.65rem] text-[var(--noche)]">
          Ideal en familia
        </span>
      )}
      <h3 className="font-display text-3xl sm:text-4xl">{p.nombre}</h3>
      {conDescuento && precioConDescuento(p.precio) !== null ? (
        <>
          <p className="mt-3 flex items-baseline gap-3">
            <span className="font-display text-4xl tabular-nums text-[var(--oro)]">{precio(precioConDescuento(p.precio)!)}</span>
            <s className="tabular-nums text-white/45">{precio(p.precio)}</s>
          </p>
          <p className="mt-1 text-sm text-white/60">Con {textoDescuento()} reservando por la web</p>
        </>
      ) : (
        <>
          <p className="mt-3 font-display text-4xl tabular-nums text-[var(--oro)]">{precio(p.precio)}</p>
          {conDescuento && <p className="mt-1 text-sm text-white/60">Con {textoDescuento()} si reservas por la web</p>}
        </>
      )}
      <ul className="mt-6 space-y-2.5 text-white/85">
        {p.incluye.map((x) => (
          <li key={x} className="flex items-center gap-3">
            <Check className="size-4 shrink-0 text-[var(--oro)]" aria-hidden />
            {x}
          </li>
        ))}
      </ul>
      <a
        href="#contacto"
        onClick={() => reservar(p)}
        className={cn(
          "group mt-8 inline-flex h-12 items-center justify-center gap-2 self-start rounded-full pl-6 pr-4 text-sm font-medium transition-colors",
          destacado ? "bg-[var(--oro)] text-[var(--noche)] hover:bg-[var(--oro-claro)]" : "bg-white text-[var(--noche)] hover:bg-white/85"
        )}
      >
        Reservar {p.nombre}
        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
      </a>
    </div>
  );
}

/**
 * Especial «Navidad en casa»: fotos del set nuevo, los dos paquetes y la oferta para los
 * primeros que reserven por la web. Los datos salen de `content/navidad.json`.
 */
export function Navidad() {
  const [visor, setVisor] = useState<number | null>(null);
  const conDescuento = cuposRestantes() > 0;

  return (
    <section id="navidad" data-parada="inicio" className="navidad relative overflow-hidden bg-[var(--noche)] py-24 text-white sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_0%,rgb(125_29_34/0.35),transparent),radial-gradient(ellipse_50%_40%_at_0%_100%,rgb(31_58_43/0.45),transparent)]"
      />
      <Destellos cantidad={28} />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="antetitulo text-[var(--oro)]">Especial de temporada</p>
            <h2 className="mt-3 leading-none">
              <RevealText as="p" text="El set de" className="text-5xl sm:text-7xl" />
              <span className="brillo-oro block font-script text-6xl sm:text-8xl">Navidad en casa</span>
            </h2>
          </div>
          <FadeUp>
            <p className="max-w-sm text-white/75 lg:text-right">
              Ven con tu familia, tu pareja o tus amigas. Nosotros ponemos el set, la luz y la magia; ustedes, las sonrisas.
            </p>
          </FadeUp>
        </div>

        <div className="mt-14 lg:mb-10">
          <FotosSet onAbrir={setVisor} />
        </div>

        {conDescuento && (
          <FadeUp className="oferta-borde relative mt-16 flex flex-col gap-5 rounded-2xl bg-white/[0.04] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <p className="flex items-start gap-3 text-lg">
              <Gift className="regalo mt-1 size-5 shrink-0 text-[var(--oro)]" aria-hidden />
              <span>
                <strong className="font-semibold">Primeros {navidad.oferta.cupos} cupos:</strong> {textoDescuento()} al reservar tu sesión
                navideña desde esta página.
              </span>
            </p>
            <Cupos className="shrink-0 sm:text-right [&>div]:sm:justify-end" />
          </FadeUp>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {navidad.paquetes.map((p, i) => (
            <FadeUp key={p.id} delay={i * 0.1}>
              <TarjetaPaquete p={p} conDescuento={conDescuento} />
            </FadeUp>
          ))}
        </div>

        <FadeUp className="mt-8 flex flex-col gap-3 border-t border-white/15 pt-6 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {navidad.adicionales.map((a) => (
              <li key={a.nombre}>
                {a.nombre}: <span className="tabular-nums text-white">{precio(a.precio)}</span>
              </li>
            ))}
          </ul>
          {conDescuento && <p className="text-white/50">{navidad.oferta.condicion}</p>}
        </FadeUp>
      </div>

      {visor !== null && <Lightbox photos={FOTOS} index={visor} onChange={setVisor} onClose={() => setVisor(null)} />}
    </section>
  );
}
