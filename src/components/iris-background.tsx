"use client";

import { useEffect, useRef } from "react";

/**
 * Fondo decorativo: anillos concéntricos tipo diafragma de lente rotando
 * a distintas velocidades, más un brillo iridiscente que sigue el mouse.
 * Puramente estético (aria-hidden) — no debe interferir con el contenido.
 */
export function IrisBackground() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function handleMove(e: MouseEvent) {
      const el = glowRef.current;
      if (!el) return;
      el.style.setProperty("--x", `${e.clientX}px`);
      el.style.setProperty("--y", `${e.clientY}px`);
      el.style.opacity = "1";
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black" aria-hidden>
      {/* anillos tipo diafragma de cámara */}
      <div className="absolute left-1/2 top-1/2 h-[130vmax] w-[130vmax] -translate-x-1/2 -translate-y-1/2 motion-reduce:hidden">
        <div className="absolute inset-0 animate-[spin_70s_linear_infinite] rounded-full border border-dashed border-white/[0.08]" />
        <div className="absolute inset-[7%] animate-[spin-reverse_95s_linear_infinite] rounded-full border border-dashed border-white/[0.06]" />
        <div className="absolute inset-[14%] animate-[spin_120s_linear_infinite] rounded-full border border-dashed border-white/[0.05]" />
        <div className="absolute inset-[21%] animate-[spin-reverse_150s_linear_infinite] rounded-full border border-white/[0.04]" />
      </div>

      {/* brillo iridiscente que sigue el cursor */}
      <div
        ref={glowRef}
        className="absolute h-[36vmax] w-[36vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-700 motion-reduce:hidden"
        style={{
          left: "var(--x, 50%)",
          top: "var(--y, 40%)",
          background:
            "radial-gradient(circle, rgba(168,85,247,0.16) 0%, rgba(56,189,248,0.10) 35%, rgba(244,114,182,0.06) 55%, transparent 75%)",
          animation: "iris-hue 16s linear infinite",
        }}
      />
    </div>
  );
}
