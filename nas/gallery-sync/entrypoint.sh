#!/bin/bash
/scripts/regenerate-manifest.sh || true
# Las copias reducidas y el manifest los escribe el propio script: no deben volver a dispararlo.
while inotifywait -qq -r -e create,delete,moved_to,moved_from,close_write \
    --exclude '/(_thumbs|_web)(/|$)|manifest\.json$|/@eaDir' /galeria; do
  sleep 5  # deja terminar copias de varias fotos antes de regenerar
  /scripts/regenerate-manifest.sh || true
done
