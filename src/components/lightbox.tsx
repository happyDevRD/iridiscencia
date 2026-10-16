import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type LightboxPhoto = { src: string; alt: string; caption: string };

type Props = {
  photos: LightboxPhoto[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
};

export function Lightbox({ photos, index, onChange, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const photo = photos[index];
  const prev = () => onChange((index - 1 + photos.length) % photos.length);
  const next = () => onChange((index + 1) % photos.length);

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
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>("button");
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

  // Precarga la siguiente para que avanzar sea inmediato.
  useEffect(() => {
    const img = new Image();
    img.src = photos[(index + 1) % photos.length].src;
  }, [index, photos]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Visor de fotos"
      className="fixed inset-0 z-[100] flex flex-col bg-background/97"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
        touchX.current = null;
      }}
    >
      <div className="flex h-16 shrink-0 items-center justify-between px-5 text-sm text-muted-foreground sm:px-8">
        <span aria-live="polite">
          {photo.caption} <span className="tabular-nums">{index + 1} / {photos.length}</span>
        </span>
        <button ref={closeRef} type="button" aria-label="Cerrar visor" onClick={onClose} className="-mr-2 p-2 text-foreground">
          <X className="size-6" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-6 sm:px-20" onClick={onClose}>
        <img
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full object-contain"
        />
        <button
          type="button"
          aria-label="Foto anterior"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className="absolute left-2 hidden p-3 text-foreground/70 hover:text-foreground sm:block"
        >
          <ChevronLeft className="size-8" />
        </button>
        <button
          type="button"
          aria-label="Foto siguiente"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className="absolute right-2 hidden p-3 text-foreground/70 hover:text-foreground sm:block"
        >
          <ChevronRight className="size-8" />
        </button>
      </div>
    </div>
  );
}
