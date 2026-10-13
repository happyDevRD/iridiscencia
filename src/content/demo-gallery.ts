import type { GalleryManifest } from "@/lib/gallery";

/**
 * Manifest de demo (solo `import.meta.env.DEV`) para poder ver el portafolio
 * con fotos reales mientras no hay NAS conectado en local. Fotos de Unsplash
 * (licencia libre) elegidas por tema — reemplazar por las reales del estudio
 * cuando estén disponibles; nunca se usa en producción (ver `lib/gallery.ts`).
 */
function unsplash(id: string, width: number) {
  return `https://images.unsplash.com/photo-${id}?w=${width}&q=80&auto=format&fit=crop`;
}

function fotosDe(ids: string[]) {
  return ids.map((id) => ({ src: unsplash(id, 1600), thumb: unsplash(id, 600) }));
}

export const demoGalleryManifest: GalleryManifest = {
  categorias: [
    {
      id: "bodas",
      nombre: "Bodas",
      fotos: fotosDe([
        "1520854221256-17451cc331bf",
        "1532712938310-34cb3982ef74",
        "1573676048035-9c2a72b6a12a",
        "1537633552985-df8429e8048b",
        "1604017011826-d3b4c23f8914",
        "1519741196428-6a2175fa2557",
      ]),
    },
    {
      id: "xv-anos",
      nombre: "XV Años",
      fotos: fotosDe([
        "1714611302520-5afa2c3e26df",
        "1640827013600-1f5411ec366b",
        "1705626313801-3f514863ca83",
        "1705626308236-490402f6c1cd",
        "1656918749115-0657cf6f941a",
        "1659310933156-b7b6a23e6f5a",
      ]),
    },
    {
      id: "corporativo",
      nombre: "Corporativo",
      fotos: fotosDe([
        "1500648767791-00dcc994a43e",
        "1580489944761-15a19d654956",
        "1560250097-0b93528c311a",
        "1573496359142-b8d87734a5a2",
        "1568602471122-7832951cc4c5",
        "1573497019940-1c28c88b4f3e",
      ]),
    },
    {
      id: "retratos",
      nombre: "Retratos",
      fotos: fotosDe([
        "1531746020798-e6953c6e8e04",
        "1557053910-d9eadeed1c58",
        "1571513722275-4b41940f54b8",
        "1535713875002-d1d0cf377fde",
        "1621784562877-e971f1f79f47",
        "1684598273432-8f8e882cd16f",
      ]),
    },
  ],
};
