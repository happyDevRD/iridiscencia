import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // En desarrollo, sin VITE_GALLERY_BASE_URL, el catálogo de ProStock se lee
    // del sitio publicado (ver docs/prostock-catalogo.md).
    proxy: {
      "/catalogo": { target: "https://iridiscencia.com", changeOrigin: true },
    },
  },
});
