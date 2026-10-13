import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fetchGalleryManifest, type GalleryManifest, type GalleryPhoto } from "@/lib/gallery";

gsap.registerPlugin(ScrollTrigger);

type Proyecto = GalleryPhoto & { categoria: string };

function Skeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`aspect-[4/3] animate-pulse rounded-2xl bg-card ${
            i % 2 === 0 ? "md:col-span-7" : "md:col-span-5"
          }`}
        />
      ))}
    </div>
  );
}

export function ProyectosDestacados() {
  const [manifest, setManifest] = useState<GalleryManifest | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGalleryManifest().then((data) => {
      if (!data) {
        setStatus("error");
        return;
      }
      setManifest(data);
      setStatus("ready");
    });
  }, []);

  const proyectos: Proyecto[] = useMemo(
    () =>
      (manifest?.categorias ?? []).flatMap((c) =>
        c.fotos.map((foto) => ({ ...foto, categoria: c.nombre }))
      ),
    [manifest]
  );

  useEffect(() => {
    if (status !== "ready" || !gridRef.current) return;

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(".bento-item");
      items.forEach((item, i) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: (i % 4) * 0.06,
            scrollTrigger: { trigger: item, start: "top 88%" },
          }
        );
        gsap.to(item.querySelector("img"), {
          yPercent: 8,
          ease: "none",
          scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    }, gridRef);

    return () => ctx.revert();
  }, [status, proyectos.length]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i === null ? i : (i + 1) % proyectos.length));
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) => (i === null ? i : (i - 1 + proyectos.length) % proyectos.length));
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, proyectos.length]);

  return (
    <section id="proyectos" className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-28">
        <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">Portafolio</p>
        <h2 className="mt-3 font-display text-4xl italic text-foreground sm:text-5xl">Proyectos Destacados</h2>
        <p className="mt-4 max-w-lg text-muted-foreground">
          Selección de sesiones de bodas, XV años, eventos corporativos y retratos — precisión técnica con
          una mirada cálida.
        </p>

        <div className="mt-14">
          {status === "loading" && <Skeleton />}

          {status === "error" || (status === "ready" && proyectos.length === 0) ? (
            <p className="py-16 text-center text-muted-foreground">La galería estará disponible pronto.</p>
          ) : null}

          {status === "ready" && proyectos.length > 0 && (
            <div ref={gridRef} className="grid grid-cols-1 gap-4 md:grid-cols-12">
              {proyectos.map((proyecto, i) => (
                <button
                  key={proyecto.src}
                  onClick={() => setLightboxIndex(i)}
                  className={`bento-item group relative aspect-[4/3] overflow-hidden rounded-2xl bg-card ${
                    i % 3 === 0 ? "md:col-span-7" : "md:col-span-5"
                  }`}
                >
                  <img src={proyecto.thumb} alt="" loading="lazy" className="h-full w-full scale-110 object-cover" />
                  <div className="absolute inset-0 flex items-end bg-background/0 p-6 opacity-0 backdrop-blur-0 transition-all duration-300 group-hover:bg-background/40 group-hover:opacity-100 group-hover:backdrop-blur-sm">
                    <span className="font-display text-2xl italic text-white">{proyecto.categoria}</span>
                    <ArrowUpRight className="ml-auto size-6 text-white" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {lightboxIndex !== null && proyectos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            aria-label="Cerrar"
            onClick={() => setLightboxIndex(null)}
            className="absolute right-6 top-6 text-foreground/70 hover:text-foreground"
          >
            <X className="size-7" />
          </button>
          <button
            aria-label="Anterior"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => (i === null ? i : (i - 1 + proyectos.length) % proyectos.length));
            }}
            className="absolute left-4 text-foreground/70 hover:text-foreground"
          >
            <ChevronLeft className="size-8" />
          </button>
          <img
            src={proyectos[lightboxIndex].src}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
          />
          <button
            aria-label="Siguiente"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => (i === null ? i : (i + 1) % proyectos.length));
            }}
            className="absolute right-4 text-foreground/70 hover:text-foreground"
          >
            <ChevronRight className="size-8" />
          </button>
        </div>
      )}
    </section>
  );
}
