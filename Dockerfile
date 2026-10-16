# Sitio estático (Vite) servido por nginx en el NAS del estudio.
# Se construye en house-pc con nas/deploy-web.sh; no se publica en ningún registro.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_WEB3FORMS_KEY=""
# Vacío: galería (/galeria) y catálogo (/catalogo) se sirven en el mismo origen.
ARG VITE_GALLERY_BASE_URL=""
ENV VITE_WEB3FORMS_KEY=$VITE_WEB3FORMS_KEY VITE_GALLERY_BASE_URL=$VITE_GALLERY_BASE_URL
RUN npm run build

FROM nginx:alpine
COPY nas/web-nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
