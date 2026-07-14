"use client";

import { useEffect, useState } from "react";
import { fetchGalleryManifest, type GalleryManifest } from "@/lib/gallery";

export function Gallery() {
  const [manifest, setManifest] = useState<GalleryManifest | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

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

  if (status === "loading") {
    return <p className="py-16 text-center text-white/50">Cargando galería…</p>;
  }

  if (status === "error" || !manifest || manifest.categorias.length === 0) {
    return (
      <p className="py-16 text-center text-white/50">
        La galería estará disponible pronto.
      </p>
    );
  }

  return (
    <div className="space-y-16">
      {manifest.categorias.map((categoria) => (
        <section key={categoria.id}>
          <h2 className="mb-6 font-serif text-2xl">{categoria.nombre}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {categoria.fotos.map((foto) => (
              <a
                key={foto.src}
                href={foto.src}
                target="_blank"
                rel="noreferrer"
                className="block aspect-square overflow-hidden bg-white/5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={foto.thumb}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
