# Estado de la web (iridiscencia.com) — 2026-10-16

En producción: commit `1449edc` (2026-10-21), servido desde el NAS con `nas/deploy-web.sh`. Para volver a la versión anterior: `nas/deploy-web.sh rollback`.

## Diseño actual

Limpio, sobre blanco, con las fotos de protagonistas. Titulares en **Fraunces** y texto en **Manrope** (elegidas el 2026-10-19 frente a Cormorant + Jost y Marcellus + Figtree). Animaciones con `motion` y scroll suave con `lenis`. Todo respeta `prefers-reduced-motion`.

| Sección | Componente | Qué hace |
|---|---|---|
| Inicio | `hero.tsx` → `heroes/hero-muro.tsx` | Pantalla completa: muro de fotos del NAS inclinado en 3D, con columnas que corren en sentidos opuestos, siguen al mouse y se acercan con el scroll. Titular centrado en blanco y cinta de servicios. Elegido el 2026-10-19 frente al anillo 3D y la foto dentro de las letras |
| Galería con zoom | `zoom-parallax.tsx` | 7 fotos que se abren desde el centro al hacer scroll |
| Trabajo reciente | `proyectos-destacados.tsx` | Galería con filtros por categoría y visor |
| Sesiones | `paquetes.tsx` | Acordeón de fotos con precios y combos de ProStock; carrusel en móvil |
| Cómo trabajamos | `proceso.tsx` | 4 pasos |
| Contacto | `contacto-footer.tsx` | Formulario y canales, con el nombre del estudio a todo el ancho. Al elegir sesión y fecha ofrece solo las horas libres de la agenda de ProStock (`src/lib/agenda.ts`, `/api/disponibilidad`): cada 30 min para sesiones de media hora, cada hora para las demás; bodas y XV apartan el día completo. Duración por paquete y horario del estudio se editan en el CMS |
| Portal de clientes | `seleccion/SelectionApp.tsx` | `iridiscencia.com/seleccion/<token>`, para que el cliente elija sus fotos |

**Scroll guiado** (`src/lib/paradas.ts`, sobre Lenis): si el scroll se detiene cerca del inicio de una sección marcada con `data-parada`, termina de llevarte a ella (30% de pantalla de margen; 45% en Sesiones, con `data-parada-fuerte`). Lejos de una parada el scroll es libre. Sesiones ocupa exactamente una pantalla para verse siempre entera; en pantallas bajas oculta la lista de combos.

Helpers de animación: `src/components/motion.tsx`. Las fotos se reúnen en `src/lib/fotos.ts`; `conRelleno` completa con las fotos de stock de `site.json` y `paquetes.json` solo mientras el NAS tenga pocas.

Diseños descartados por el cliente: oscuro con nombre iridiscente e intro de diafragma, y «hoja de contactos» (película y lápiz rojo).

## Fotos

- La web lee `/volume1/Galeria/` del NAS. Hay una carpeta por categoría (`00 Portada`, `01 Bodas` … `10 Familia`), y `_Sin publicar` se ignora. Las reglas para el staff están en el `LEEME` de esa carpeta (fuente: `nas/gallery-sync/LEEME.txt`).
- `gallery-sync` (libvips) genera las versiones `_web` y `_thumbs` y el `manifest.json` cada vez que cambia algo.
- **Las fotos terminadas del estudio** están en `/volume1/Entregas/<MES RED>/<sesión>/S/Ori_Evoto/*.jpg`: retocadas, con marca de agua, ~3300 px. Las de `S/*.jpg` son la versión sin retoque, y `jpg/` son JPG de cámara.
- El 2026-10-16 se publicaron 135 fotos de `Entregas`, con nombres neutros (`<categoria>-NNNN.jpg`) porque las carpetas originales llevan nombre y teléfono del cliente.

## Pendiente

- [x] **Contacto (2026-10-19):** teléfono +1 849-631-8221, correo iridiscenciaf@gmail.com y dirección (Plaza Dora, calle Porvenir) en `src/content/site.json`; logo oficial en `public/logo.png` e `isotipo.png` (componente `src/components/logo.tsx`, se pinta con `currentColor`) y favicons.
- [x] **WhatsApp (2026-10-19):** mismo número que el teléfono. Botón flotante (`src/components/whatsapp.tsx`), icono en los botones de cotizar y el formulario envía por WhatsApp mientras no haya Web3Forms.
- [x] **Instagram (2026-10-19):** @iridiscencia_film.
- [x] **Favicon (2026-10-21):** isotipo sobre fondo blanco redondeado. Al cambiar el icono, sube la versión `?v=N` en `index.html`: Chrome guarda los favicons en caché y no los vuelve a pedir.
- [ ] **Correo propio (opcional):** la web ya usa iridiscenciaf@gmail.com. Para usar `contacto@iridiscencia.com` haría falta Cloudflare Email Routing hacia ese Gmail (el dominio no tiene MX).
- [ ] **Formulario:** key de Web3Forms (`VITE_WEB3FORMS_KEY` en `.env.local` antes de `deploy-web.sh`).
- [ ] **Fotos:** no hay de Pre-boda, hay pocas de Bodas y de Eventos, y la portada necesita fotos horizontales.
- [ ] Revisar en un móvil real el zoom y el acordeón de Sesiones.
- [ ] SEO: alta en Google Search Console (enviar `sitemap.xml`) y Google Business Profile.
- [ ] Más adelante: sobre nosotros, testimonios, preguntas frecuentes, y reservas desde la web hacia ProStock.
