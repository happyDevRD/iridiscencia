# Iridiscencia

Sitio de una sola página para Iridiscencia, estudio de fotografía en San Pedro de Macorís (bodas, XV años, eventos corporativos y retratos).

## Stack

React 19 + TypeScript + Vite + Tailwind CSS v4, con GSAP (ScrollTrigger) y `motion` (Framer Motion) para las animaciones. La galería de fotos se sirve por separado desde el NAS (ver `nas/`).

## Comandos

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción (dist/)
npm run preview  # sirve el build de producción localmente
npm run lint     # ESLint
```

## Variables de entorno

Copiar `.env.example` a `.env.local`:

- `VITE_WEB3FORMS_KEY` — access key de [Web3Forms](https://web3forms.com/) para el formulario de contacto
- `VITE_GALLERY_BASE_URL` — host donde vive la galería de fotos (nginx en el NAS, ver `nas/`)

## CMS

Sveltia CMS en `/admin` edita `src/content/site.json` y `src/content/paquetes.json` vía GitHub OAuth (config en `public/admin/config.yml`).

## Despliegue

Cloudflare Pages, build `npm run build`, output `dist`.
