#!/bin/bash
/scripts/regenerate-manifest.sh || true
while inotifywait -r -e create,delete,moved_to,moved_from,close_write --exclude '_thumbs|manifest\.json' /galeria; do
  sleep 2
  /scripts/regenerate-manifest.sh || true
done
