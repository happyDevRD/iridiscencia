# Estado de la web (iridiscencia.com) — 2026-10-16

En producción: commit `1473389`, servido desde el NAS con `nas/deploy-web.sh`. Para volver a la versión anterior: `nas/deploy-web.sh rollback`.

## Diseño actual

Limpio, sobre blanco, con las fotos de protagonistas. Titulares en **Bodoni Moda** y texto en **Hanken Grotesk**. Animaciones con `motion` y scroll suave con `lenis`. Todo respeta `prefers-reduced-motion`.

| Sección | Componente | Qué hace |
|---|---|---|
| Inicio | `hero.tsx` | Titular que se revela palabra a palabra, collage de 3 fotos con parallax y cinta de servicios |
| Galería con zoom | `zoom-parallax.tsx` | 7 fotos que se abren desde el centro al hacer scroll |
| Trabajo reciente | `proyectos-destacados.tsx` | Galería con filtros por categoría y visor |
| Sesiones | `paquetes.tsx` | Acordeón de fotos con precios y combos de ProStock; carrusel en móvil |
| Cómo trabajamos | `proceso.tsx` | 4 pasos |
| Contacto | `contacto-footer.tsx` | Formulario y canales, con el nombre del estudio a todo el ancho |
| Portal de clientes | `seleccion/SelectionApp.tsx` | `iridiscencia.com/seleccion/<token>`, para que el cliente elija sus fotos |

Helpers de animación: `src/components/motion.tsx`. Las fotos se reúnen en `src/lib/fotos.ts`; `conRelleno` completa con las fotos de stock de `site.json` y `paquetes.json` solo mientras el NAS tenga pocas.

Diseños descartados por el cliente: oscuro con nombre iridiscente e intro de diafragma, y «hoja de contactos» (película y lápiz rojo).

## Fotos

- La web lee `/volume1/Galeria/` del NAS. Hay una carpeta por categoría (`00 Portada`, `01 Bodas` … `10 Familia`), y `_Sin publicar` se ignora. Las reglas para el staff están en el `LEEME` de esa carpeta (fuente: `nas/gallery-sync/LEEME.txt`).
- `gallery-sync` (libvips) genera las versiones `_web` y `_thumbs` y el `manifest.json` cada vez que cambia algo.
- **Las fotos terminadas del estudio** están en `/volume1/Entregas/<MES RED>/<sesión>/S/Ori_Evoto/*.jpg`: retocadas, con marca de agua, ~3300 px. Las de `S/*.jpg` son la versión sin retoque, y `jpg/` son JPG de cámara.
- El 2026-10-16 se publicaron 135 fotos de `Entregas`, con nombres neutros (`<categoria>-NNNN.jpg`) porque las carpetas originales llevan nombre y teléfono del cliente.

## Pendiente

- [ ] **Contacto:** WhatsApp, teléfono, Instagram y dirección en `src/content/site.json`. Sin WhatsApp, los botones de cotizar llevan al formulario.
- [ ] **Correo:** `iridiscencia.com` no tiene registro MX, así que `contacto@iridiscencia.com` no recibe nada. Activar Cloudflare Email Routing hacia el Gmail del estudio.
- [ ] **Formulario:** key de Web3Forms (`VITE_WEB3FORMS_KEY` en `.env.local` antes de `deploy-web.sh`).
- [ ] **Fotos:** no hay de Pre-boda, hay pocas de Bodas y de Eventos, y la portada necesita fotos horizontales.
- [ ] Revisar en un móvil real el zoom y el acordeón de Sesiones.
- [ ] SEO: alta en Google Search Console (enviar `sitemap.xml`) y Google Business Profile.
- [ ] Más adelante: sobre nosotros, testimonios, preguntas frecuentes, y reservas desde la web hacia ProStock.
