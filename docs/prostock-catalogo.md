# Catálogo de Iridiscencia en ProStock e integración con la web

Base de conocimiento para conectar el sitio (`iridiscencia.com`) con el sistema de ventas del estudio (ProStock). Estado al **2026-10-16**.

## Dónde vive cada cosa

| Pieza | Dónde | Notas |
|---|---|---|
| Sitio web | Este repo, Vite + React SPA estática, Cloudflare Pages | Los paquetes hoy salen de `src/content/paquetes.json` (4 entradas genéricas, precio "Consultar"), editables con Sveltia CMS. |
| ProStock (POS/inventario/facturación) | NAS DS420+ del estudio, `http://192.168.100.200:8080` (solo LAN o VPN) | Repos `happyDevRD/proStock` (backend Spring Boot) y `happyDevRD/proStockFront`. Compose en `/volume1/docker/prostock-irisdicencia/`. DB `prestockdb_iridiscencia`. |
| Galería pública | Mismo NAS, `gallery-nginx` detrás del Cloudflare Tunnel `iridiscencia-nas` → `galeria.iridiscencia.com` | Ya es un origen público con CORS hacia `https://iridiscencia.com` (ver `nas/gallery-nginx/nginx.conf`). |

ProStock **no está expuesto a internet** y su API exige JWT en todo salvo login, `/actuator/health`, `/uploads/**` y `GET /api/portal/company-info`. Este último es un precedente de endpoint público de solo lectura.

## Reglas del catálogo (reorganizado el 2026-10-16)

- **Precios con ITBIS incluido.** La empresa tiene `company_config.precios_incluyen_itbis = true`. `products.selling_price` es el precio final al cliente (ITBIS 18%). La web debe mostrar `selling_price` tal cual, sin sumar impuesto. Si hay promoción vigente, usar `effectiveSellingPrice` del DTO.
- **Tipo:** los enmarcados son `BIEN` (descuentan stock, mínimo 2). Todo lo demás es `SERVICIO` (sin stock).
- **SKU:** `LÍNEA-DETALLE-NIVEL`. Los prefijos de línea están en la tabla de categorías.
- **Costos:** todavía iguales al precio; el estudio los cargará. Nunca exponer `cost_price` en la web.
- Las ventas guardan su propia copia de SKU y nombre, así que renombrar productos no altera facturas pasadas.

### Categorías

| Categoría | Prefijo | Tipo | Contenido |
|---|---|---|---|
| Sesiones y combos | `SES-<evento>-<nivel>` | Servicio | Paquetes por evento: CUM cumpleaños, BEB niños y bebés, BAC bachiller, GRA graduación universitaria, XV quinceañeras, PRB pre-boda, BOD bodas |
| Fotos de documento | `DOC-2X2-…` | Servicio | Fotos 2x2 para documentos y pasaportes |
| Impresiones | `IMP-<ancho>X<alto>` | Servicio | Impresión suelta, tamaño en pulgadas con dos cifras |
| Enmarcados | `ENM-<ancho>X<alto>` | Bien | Foto con marco |
| Copias | `COP-…` | Servicio | Fotocopias |
| Adicionales | `ADI-…` | Servicio | Foto extra digital o impresa, cambio de ropa |

### Paquetes (Sesiones y combos activos), candidatos a mostrarse en la web

Precios en RD$ con ITBIS. Fuente: ProStock, 2026-10-16. Pueden cambiar, así que la web debe leerlos del sistema y no copiarlos.

| SKU | Nombre | Precio | Incluye |
|---|---|---|---|
| SES-CUM-1 | Combo Cumpleaños 1 | 3.450 | 4 fotos digitales |
| SES-CUM-2 | Combo Cumpleaños 2 | 4.650 | 7 fotos digitales · Incluye cambio de ropa |
| SES-CUM-3 | Combo Cumpleaños 3 | 6.850 | 10 fotos digitales e impresas 5x7 · 2 llaveros · Incluye cambio de ropa |
| SES-BEB-1 | Combo Niños y Bebés 1 | 3.950 | 3 fotos digitales |
| SES-BEB-2 | Combo Niños y Bebés 2 | 5.350 | 5 fotos digitales e impresas 5x7 |
| SES-BAC-1 | Combo Bachiller 1 | 3.450 | 4 fotos digitales · 1 foto 8x10 enmarcada |
| SES-BAC-2 | Combo Bachiller 2 | 4.650 | 8 fotos impresas y digitales 5x7 · 1 foto 8x13 enmarcada · 2 llaveros · Toga |
| SES-GRA-1 | Combo Graduación Universitaria 1 | 5.900 | 5 fotos digitales e impresas · 1 foto 10x13 enmarcada · 1 llavero |
| SES-GRA-2 | Combo Graduación Universitaria 2 | 7.650 | 8 fotos digitales e impresas · 1 foto 11x17 enmarcada · 4 llaveros |
| SES-GRA-3 | Combo Graduación Universitaria 3 | 9.300 | 12 fotos digitales e impresas · 1 foto 12x18 enmarcada · 6 llaveros |
| SES-XV-1 | Combo XV Años 1 | 9.300 | 5 fotos impresas y digitales 5x7 · 1 foto 8x10 enmarcada · 2 llaveros |
| SES-XV-2 | Combo XV Años 2 | 17.650 | Álbum 6x6 de 10 lienzos · 25 fotos digitales · 1 foto 10x13 enmarcada · 5 llaveros |
| SES-XV-3 | Combo XV Años 3 | 27.850 | Álbum 8x10 de 10 lienzos · 30 fotos digitales · 1 foto 13x19 enmarcada · 6 llaveros · Video de 2 minutos |
| SES-PRB-1 | Combo Pre-boda 1 | 12.800 | 10 fotos digitales · 1 foto 8x11 enmarcada |
| SES-PRB-2 | Combo Pre-boda 2 | 22.800 | 20 fotos digitales · 1 foto 10x13 enmarcada |
| SES-BOD-1 | Combo Bodas 1 | 24.650 | Álbum digital 6x6 de 10 lienzos · 25 fotos digitales · 1 foto 13x15 enmarcada · 4 llaveros |
| SES-BOD-2 | Combo Bodas 2 | 35.800 | Álbum digital 6x6 de 10 lienzos · 35 fotos digitales · 1 foto 13x19 enmarcada · 4 llaveros |
| SES-BOD-3 | Combo Bodas 3 | 48.650 | Álbum digital 8x10 de 5 lienzos · 50 fotos digitales · 1 foto 13x19 enmarcada · 6 llaveros |

Desactivado: `CMBB03` "Combo 3 de Niños y Bebés" (id 16). No mostrarlo.

**Datos por confirmar con el estudio** antes de publicarlos (pestaña "Por confirmar" del Sheet de trabajo):
- medidas 13x15 (Bodas 1), 8x11 (Pre-boda 1) y 8x13 (Bachiller 2), que no existen entre los enmarcados;
- álbum de 5 lienzos en Bodas 3 frente a 10 en Bodas 2;
- si "Foto 2x2 Normal" (300) y "Foto 2x2 Estudio o Trabajo" (200) son el mismo producto.

Sheet de trabajo en Google Drive: "Irisdicencia — Catálogo organizado (propuesta)", id `1p3uGSXuojwwDX-f5KEAlQXnwJ0JOOTOj7DLxRIXcG6I`.

## Datos del producto en ProStock útiles para la web

Tabla `products` (DTO `ProductDto`): `id`, `sku`, `name`, `description` (ítems separados por " · "), `category_id`, `selling_price`, `effectiveSellingPrice` (con promoción), `promo_price`, `promo_percent_off`, `promo_start_date`, `promo_end_date`, `status` (`ACTIVE`, `INACTIVE` o `DISCONTINUED`), `icon`, imágenes (`ProductImage`, servidas en `/uploads/**`). No hay campo que diga qué productos van a la web, así que habrá que decidir si se publica por categoría o se agrega un campo `visible_web`.

## Integración implementada (opción 1, 2026-10-16)

- **Exportador:** servicio `catalogo-export` en el stack `prostock-irisdicencia` del NAS (fuente en `~/nas/irisdicencia-ds420/prostock-compose/catalogo-export/` de house-pc). Usa la imagen `postgres:16-alpine` (ya en el NAS) y unos 1,5 MB de RAM.
  - Cada 5 minutos ejecuta `catalogo.sql` y reescribe `/volume1/docker/iridiscencia-catalogo/catalogo.json`, solo si cambiaron los datos.
  - Si la consulta falla, conserva el último archivo bueno y lo registra en `docker logs prostock-irisdicencia-catalogo-export-1`.
- **Usuario de base de datos `catalogo_web`:** solo `SELECT` sobre `products`, `categories` y `company_config`, con límite de 2 conexiones. La contraseña está en `CATALOGO_DB_PASSWORD` del `.env` del stack (600).
- **Publicación:** hoy el contenedor `iridiscencia-web` del NAS monta esa carpeta en `/catalogo/`, así que el archivo está en `https://iridiscencia.com/catalogo/catalogo.json` (mismo origen, sin CORS). Cuando el sitio pase a Cloudflare Pages lo servirá `gallery-nginx` en `galeria.iridiscencia.com/catalogo/` con CORS (ya preparado en `nas/`).
- **Formato:** `{generado, moneda, preciosIncluyenItbis, categorias: [{id, nombre, productos: [{sku, nombre, descripcion, incluye[], precio, precioRegular, enPromocion, icono}]}]}`. Incluye solo productos `ACTIVE` y `for_sale`. `precio` ya aplica la promoción vigente (misma regla que `PromoPriceUtils`, con fecha de RD).
- **Web:** `src/lib/catalogo.ts` carga el archivo desde `${VITE_GALLERY_BASE_URL}/catalogo/catalogo.json`. Cada paquete de `src/content/paquetes.json` tiene `prefijosSku` (editable en el CMS); `src/components/paquetes.tsx` lista los combos que empiezan así, con precio y lo que incluyen, y muestra "Desde RD$ X". Sin prefijos, o si el catálogo no carga, se usa el texto del CMS. En `npm run dev` hay un proxy de `/catalogo` hacia `iridiscencia.com`.

## Otras opciones de integración

1. **Exportación a JSON en el NAS (la implementada).** Un proceso dentro de la LAN genera `catalogo.json` con los productos activos publicables (sin costo ni stock) y lo deja junto a la galería. `gallery-nginx` ya lo sirve con CORS en `galeria.iridiscencia.com`. La web lo carga igual que `manifest.json`.
   - ProStock sigue sin exponerse a internet.
   - Sin rebuild del sitio y casi sin costo de RAM en el NAS (1,75 GB).
   - El proceso puede ser un endpoint interno de ProStock, o una consulta SQL programada en el Programador de tareas de DSM (no se puede crear por SSH sin sudo interactivo).
2. **Endpoint público de solo lectura en ProStock** (`GET /api/public/catalog`, como `/api/portal/company-info`), expuesto por el túnel en un hostname nuevo.
   - Datos siempre al día.
   - Expone el POS de producción a internet, así que requiere rate limiting, caché y revisión de seguridad.
3. **Fase 2 del roadmap:** que la web cree reservas u órdenes de servicio en ProStock (reserva → orden de servicio → anticipo → factura). Esto necesita escritura autenticada, así que va por un backend intermedio o un endpoint con token propio, nunca con credenciales de usuario en el navegador.

## Gotchas

- El nombre correcto del negocio es **Iridiscencia**. ProStock usa "irisdicencia" en contenedores, carpetas y DB por herencia; no renombrarlo.
- Acceso a ProStock para mantenimiento: VPN (`~/nas/irisdicencia-ds420/openvpn/`) y luego `ssh ds420`. Docker en `/var/packages/ContainerManager/target/usr/bin/docker`.
- Hacer backup antes de tocar datos de producción: `pg_dump` hacia `/volume1/docker/backups/prostock/` y copia en `~/nas/irisdicencia-ds420/backups/`.
- Un bug de la versión de anticipos (corregido en el frontend `63ed817`) sumaba ITBIS dos veces en las órdenes de servicio. Si se toma el precio del catálogo, respetar `precios_incluyen_itbis` (helpers `catalogBasePrice` y `catalogInclusivePrice` en `proStockFront/src/lib/posTax.ts`).
