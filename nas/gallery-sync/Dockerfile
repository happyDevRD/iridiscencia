FROM alpine:3.20
RUN apk add --no-cache imagemagick imagemagick-jpeg inotify-tools jq bash
COPY regenerate-manifest.sh /scripts/regenerate-manifest.sh
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /scripts/regenerate-manifest.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
