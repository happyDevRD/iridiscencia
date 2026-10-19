import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type LightboxPhoto = { src: string; thumb?: string; alt: string; caption: string };

type Props = {
  photos: LightboxPhoto[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function Lightbox({ photos, index, onChange, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const tiraRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  // Sentido del último cambio: la foto nueva entra por ese lado
  const sentido = useRef(1);
  const reduce = useReducedMotion();
  const photo = photos[index];
  const ir = (i: number, dir: number) => {
    sentido.current = dir;
    onChange((i + photos.length) % photos.length);
  };
  const prev = () => ir(index - 1, -1);
  const next = () => ir(index + 1, 1);

  // Foco al abrir, devolverlo al cerrar, y bloquear el scroll de fondo.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>("button:not([tabindex='-1'])");
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  // Precarga la siguiente para que avanzar sea inmediato, y centra la miniatura actual.
  useEffect(() => {
    const img = new Image();
    img.src = photos[(index + 1) % photos.length].src;
    tiraRef.current
      ?.querySelector<HTMLElement>(`[data-i="${index}"]`)
      ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", inline: "center", block: "nearest" });
  }, [index, photos, reduce]);

  const desplazamiento = reduce ? 0 : 60;

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Visor de fotos"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex flex-col bg-tinta text-blanco"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
        touchX.current = null;
      }}
    >
      <div className="flex h-16 shrink-0 items-center justify-between px-5 text-sm text-blanco/70 sm:px-8">
        <span aria-live="polite">
          {photo.caption} <span className="ml-2 tabular-nums text-blanco/45">{index + 1} / {photos.length}</span>
        </span>
        <button ref={closeRef} type="button" aria-label="Cerrar visor" onClick={onClose} className="-mr-2 p-2.5 text-blanco">
          <X className="size-6" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-2 sm:px-20" onClick={onClose}>
        <AnimatePresence initial={false} custom={sentido.current} mode="popLayout">
          <motion.img
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            custom={sentido.current}
            variants={{
              entra: (dir: number) => ({ opacity: 0, x: dir * desplazamiento, scale: 0.98 }),
              centro: { opacity: 1, x: 0, scale: 1 },
              sale: (dir: number) => ({ opacity: 0, x: dir * -desplazamiento, scale: 0.98 }),
            }}
            initial="entra"
            animate="centro"
            exit="sale"
            transition={{ duration: 0.45, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded-sm object-contain"
          />
        </AnimatePresence>
        <button
          type="button"
          aria-label="Foto anterior"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className="absolute left-3 hidden size-12 place-items-center rounded-full bg-blanco/10 text-blanco/80 backdrop-blur transition-colors hover:bg-blanco/20 hover:text-blanco sm:grid"
        >
          <ChevronLeft className="size-6" />
        </button>
        <button
          type="button"
          aria-label="Foto siguiente"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className="absolute right-3 hidden size-12 place-items-center rounded-full bg-blanco/10 text-blanco/80 backdrop-blur transition-colors hover:bg-blanco/20 hover:text-blanco sm:grid"
        >
          <ChevronRight className="size-6" />
        </button>
      </div>

      {/* Tira de miniaturas para saltar a cualquier foto */}
      <div
        ref={tiraRef}
        className="flex shrink-0 gap-1.5 overflow-x-auto px-[50vw] py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((p, i) => (
          <button
            key={p.src}
            type="button"
            data-i={i}
            tabIndex={-1}
            aria-label={`Ir a la foto ${i + 1}`}
            onClick={() => ir(i, i > index ? 1 : -1)}
            className={`h-14 w-10 shrink-0 overflow-hidden rounded-sm transition-all duration-300 sm:h-16 sm:w-12 ${
              i === index ? "opacity-100 ring-1 ring-blanco ring-offset-2 ring-offset-tinta" : "opacity-40 hover:opacity-80"
            }`}
          >
            <img src={p.thumb ?? p.src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
