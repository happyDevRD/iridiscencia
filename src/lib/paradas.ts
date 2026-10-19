import type Lenis from "lenis";

const MARGEN = 0.3; // de la altura de pantalla
const MARGEN_FUERTE = 0.45;
const ESPERA = 140; // ms sin moverse para dar el scroll por terminado

/**
 * Paradas del scroll: cuando el scroll se detiene cerca de una sección marcada, termina
 * de llevarte a ella. Lejos de cualquier parada (en medio de la galería, por ejemplo) el
 * scroll queda libre.
 *
 * Marcado: `data-parada="inicio"`, `"fin"` (borde inferior con el de la pantalla) o
 * `"inicio fin"`; `data-parada-fuerte` atrae desde más lejos. El principio de la página
 * siempre es una parada.
 */
export function paradasDeScroll(lenis: Lenis): () => void {
  let timer = 0;
  let tocando = false;

  function asentar() {
    if (tocando) return;
    const vh = window.innerHeight;
    const y = window.scrollY;
    const objetivos = [{ y: 0, margen: MARGEN * vh }];
    document.querySelectorAll<HTMLElement>("[data-parada]").forEach((el) => {
      const top = el.getBoundingClientRect().top + y;
      const margen = (el.hasAttribute("data-parada-fuerte") ? MARGEN_FUERTE : MARGEN) * vh;
      for (const borde of (el.dataset.parada ?? "").split(" ")) {
        if (borde === "inicio") objetivos.push({ y: top, margen });
        if (borde === "fin") objetivos.push({ y: top + el.offsetHeight - vh, margen });
      }
    });

    let mejor: number | null = null;
    for (const o of objetivos) {
      const d = Math.abs(o.y - y);
      if (d > 2 && d <= o.margen && (mejor === null || d < Math.abs(mejor - y))) mejor = o.y;
    }
    if (mejor !== null) {
      lenis.scrollTo(mejor, {
        duration: 0.9,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        userData: { initiator: "parada" },
      });
    }
  }

  const onScroll = () => {
    if (lenis.userData?.initiator === "parada") return;
    window.clearTimeout(timer);
    timer = window.setTimeout(asentar, ESPERA);
  };
  const onTouchStart = () => {
    tocando = true;
    window.clearTimeout(timer);
  };
  const onTouchEnd = () => {
    tocando = false;
  };

  lenis.on("scroll", onScroll);
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  return () => {
    window.clearTimeout(timer);
    lenis.off("scroll", onScroll);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchend", onTouchEnd);
  };
}
