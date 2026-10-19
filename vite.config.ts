import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import siteConfig from "./src/content/site.json";

const SITE_URL = "https://iridiscencia.com/";

/** Datos estructurados (Google) generados desde site.json: el contacto vive en un solo sitio. */
function jsonLd(): string {
  const { contacto } = siteConfig;
  const instagram = contacto.instagram.trim().replace(/^@/, "");
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    additionalType: "https://schema.org/Photographer",
    name: siteConfig.nombre,
    url: SITE_URL,
    image: `${SITE_URL}og.jpg`,
    logo: `${SITE_URL}logo.png`,
    description: siteConfig.descripcion,
    email: contacto.email || undefined,
    telephone: contacto.telefono || contacto.whatsapp || undefined,
    areaServed: "República Dominicana",
    address: {
      "@type": "PostalAddress",
      streetAddress: contacto.direccion || undefined,
      addressLocality: "San Pedro de Macorís",
      addressCountry: "DO",
    },
    sameAs: instagram ? [instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram}`] : undefined,
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    { name: "site-json-ld", transformIndexHtml: (html) => html.replace("<!-- json-ld -->", jsonLd()) },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // En desarrollo, sin VITE_GALLERY_BASE_URL, el catálogo de ProStock
    // y la galería se leen
    // del sitio publicado (ver docs/prostock-catalogo.md).
    proxy: {
      "/catalogo": { target: "https://iridiscencia.com", changeOrigin: true },
      "/galeria": { target: "https://iridiscencia.com", changeOrigin: true },
      // Portal de selección: en producción lo hace el nginx del NAS; en desarrollo, un ProStock local.
      "/api/seleccion": {
        target: process.env.SELECTION_API_TARGET ?? "http://localhost:8181",
        rewrite: (p) => p.replace(/^\/api\/seleccion/, "/api/public/selection"),
      },
    },
  },
});
