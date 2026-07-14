FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_WEB3FORMS_KEY
ENV NEXT_PUBLIC_WEB3FORMS_KEY=$NEXT_PUBLIC_WEB3FORMS_KEY
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/out /usr/share/nginx/html
