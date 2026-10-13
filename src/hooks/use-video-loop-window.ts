import { useEffect, useRef } from "react";

/**
 * El clip de stock actual es un dolly zoom de ida y vuelta (ancho -> adentro del
 * lente -> ancho otra vez). Reproduce normal desde el inicio (entrada a
 * velocidad real) y, al llegar a `loopEnd` (el tramo estable "adentro"), salta
 * de vuelta a `loopStart` en vez de seguir hacia la parte final que vuelve a
 * abrirse — así nunca se ve el regreso al plano ancho. A partir del primer
 * ciclo del loop se reduce la velocidad (`loopPlaybackRate`) para que se
 * sienta como un fondo ambiental en movimiento lento con destellos, en vez de
 * un loop corto repitiéndose rápido.
 */
export function useVideoLoopWindow(loopStart: number, loopEnd: number, loopPlaybackRate = 0.45) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    function handleTimeUpdate() {
      if (!video) return;
      if (video.currentTime >= loopEnd) {
        video.currentTime = loopStart;
        video.playbackRate = loopPlaybackRate;
      }
    }

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [loopStart, loopEnd, loopPlaybackRate]);

  return ref;
}
