import { cn } from "@/lib/utils";

/**
 * Logo del estudio pintado con el color del texto (`currentColor`): el PNG se usa como
 * máscara, así el mismo archivo sirve en blanco sobre fotos y en negro sobre blanco.
 */
function Mascara({ src, className }: { src: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0 bg-current", className)}
      style={{ mask: `url(${src}) center / contain no-repeat`, WebkitMask: `url(${src}) center / contain no-repeat` }}
    />
  );
}

/** Ojo con la pluma, sin texto (proporción 1:1). */
export function Isotipo({ className }: { className?: string }) {
  return <Mascara src="/isotipo.png" className={cn("aspect-square", className)} />;
}

/** Logo completo: isotipo, «IRIDISCENCIA» y «FILM» (proporción 1000:650). */
export function LogoCompleto({ className }: { className?: string }) {
  return <Mascara src="/logo.png" className={cn("aspect-[1000/650]", className)} />;
}
