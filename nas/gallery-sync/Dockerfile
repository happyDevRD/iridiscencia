FROM alpine:3.20
# libvips reduce por franjas: unas decenas de MB por foto, frente a cientos con ImageMagick.
RUN apk add --no-cache vips-tools inotify-tools jq bash
COPY regenerate-manifest.sh /scripts/regenerate-manifest.sh
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /scripts/regenerate-manifest.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
