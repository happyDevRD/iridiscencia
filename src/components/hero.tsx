import { useEffect, useMemo, useState } from "react";
import { ArrowDown } from "lucide-react";
import siteConfig from "@/content/site.json";
import { cotizarHref, whatsappUrl } from "@/lib/contact";
import { useGaleria, type GalleryManifest } from "@/lib/gallery";
import { Lightbox, type LightboxPhoto } from "@/components/lightbox";
import { Fotograma, FotogramaVacio, Tira, Trazo } from "@/components/pelicula";

/** Una tira corta se completa con fotogramas sin exponer hasta este mínimo. */
const MIN_FOTOGRAMAS = 8;
const MAX_FOTOGRAMAS = 10;

type FotoHero = LightboxPhoto & { thumb: string; w?: number; h?: number };

/** Portada del NAS; si está vacía, lo más reciente de la galería; si no hay galería, site.json. */
function fotosDelHero(manifest: GalleryManifest | null | undefined): FotoHero[] {
  if (manifest === undefined) return [];
  const portada = (manifest?.portada ?? []).map((f) => ({
    ...f,
    alt: `Fotografía de ${siteConfig.nombre}`,
    caption: "Portada",
  }));
  if (portada.length > 0) return portada.slice(0, MAX_FOTOGRAMAS);

  const galeria = (manifest?.categorias ?? []).flatMap((c) =>
    c.fotos.map((f) => ({ ...f, alt: `${c.nombre} — ${siteConfig.nombre}`, caption: c.nombre }))
  );
  if (galeria.length > 0) return galeria.slice(0, MAX_FOTOGRAMAS);

  return siteConfig.heroFotos.map((f) => ({
    src: `${f.src}&w=2000`,
    thumb: `${f.src}&w=700`,
    alt: f.alt,
    caption: siteConfig.nombre,
  }));
}

export function Hero() {
  const manifest = useGaleria();
  const fotos = useMemo(() => fotosDelHero(manifest), [manifest]);
  const elegida = fotos.length > 1 ? 1 : 0;
  const [subrayado, setSubrayado] = useState(false);
  const [marcada, setMarcada] = useState(false);
  const [visor, setVisor] = useState<number | null>(null);
  const whatsapp = whatsappUrl("Hola, quiero cotizar una sesión con Iridiscencia.");

  // Primero se marca la frase y, cuando la tira ya se reveló, la foto elegida.
  useEffect(() => {
    const t = window.setTimeout(() => setSubrayado(true), 500);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => {
    if (fotos.length === 0) return;
    const t = window.setTimeout(() => setMarcada(true), 1500 + elegida * 120);
    return () => window.clearTimeout(t);
  }, [fotos.length, elegida]);

  const vacios = Math.max(0, MIN_FOTOGRAMAS - fotos.length);

  return (
    <section id="inicio" className="pt-16">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-14 pt-12 sm:px-8 lg:grid-cols-12 lg:items-end lg:pb-20 lg:pt-20">
        <div className="lg:col-span-7">
          <p className="etiqueta text-muted-foreground">Estudio de fotografía · {siteConfig.ubicacion}</p>
          <h1 className="mt-6 text-[clamp(2.75rem,7.2vw,6.5rem)] leading-[0.94]">
            Fotografiamos lo que{" "}
            <span className="relative inline-block whitespace-nowrap">
              no se repite
              <Trazo dibujado={subrayado} className="-inset-x-[5%] -inset-y-[16%] h-[132%] w-[110%]" />
            </span>
            .
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground">
            Bodas, XV años, maternidad, graduaciones y retratos. En nuestro estudio o donde sea tu celebración.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={cotizarHref()}
              target={whatsapp ? "_blank" : undefined}
              rel={whatsapp ? "noopener" : undefined}
              className="inline-flex h-12 items-center rounded-sm bg-foreground px-6 font-medium text-background transition-colors hover:bg-foreground/85"
            >
              {whatsapp ? "Cotizar por WhatsApp" : "Pedir cotización"}
            </a>
            <a
              href="#trabajo"
              className="inline-flex h-12 items-center gap-2 rounded-sm border border-foreground/25 px-6 font-medium transition-colors hover:border-foreground"
            >
              Ver el trabajo
              <ArrowDown className="size-4" aria-hidden />
            </a>
          </div>
        </div>

        {fotos[elegida] && (
          <figure className="hidden lg:col-span-4 lg:col-start-9 lg:block">
            <div className="bg-card p-3 pb-14 shadow-[0_1px_2px_rgb(0_0_0/0.08),0_18px_40px_-18px_rgb(0_0_0/0.35)]">
              <img
                src={fotos[elegida].src}
                alt={fotos[elegida].alt}
                fetchPriority="high"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <figcaption className="-mt-11 pl-5 font-mano text-3xl text-lapiz [transform:rotate(-2deg)]">
              ésta es la elegida
            </figcaption>
          </figure>
        )}
      </div>

      <Tira rotulo={`${siteConfig.nombre.toUpperCase()} FILM 400 · HOJA DE CONTACTOS`}>
        <ul className="flex snap-x gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:px-8" aria-label="Fotos recientes">
          {fotos.map((foto, i) => (
            <li key={foto.src} className="w-[40vw] shrink-0 snap-start sm:w-[24vw] lg:w-[calc((100%-7*0.75rem)/8)]">
              <button
                type="button"
                onClick={() => setVisor(i)}
                aria-label={`Ver foto ${i + 1}: ${foto.caption}`}
                className="group block w-full text-left"
              >
                <Fotograma
                  src={foto.thumb}
                  alt=""
                  width={foto.w}
                  height={foto.h}
                  numero={i + 1}
                  retardo={i * 120}
                  marcado={i === elegida && marcada}
                  eager={i < 4}
                />
              </button>
            </li>
          ))}
          {Array.from({ length: vacios }, (_, i) => (
            <li key={`vacio-${i}`} className="w-[40vw] shrink-0 sm:w-[24vw] lg:w-[calc((100%-7*0.75rem)/8)]">
              <FotogramaVacio numero={fotos.length + i + 1} />
            </li>
          ))}
        </ul>
      </Tira>

      {visor !== null && fotos[visor] && (
        <Lightbox photos={fotos} index={visor} onChange={setVisor} onClose={() => setVisor(null)} />
      )}
    </section>
  );
}
