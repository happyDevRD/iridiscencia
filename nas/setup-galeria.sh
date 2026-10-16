#!/bin/bash
# Crea (sin borrar nada) la estructura de carpetas de /volume1/Galeria y su LEEME,
# y despliega gallery-sync con la última versión del repo.
#
#   nas/setup-galeria.sh
#
# Requiere VPN conectada y `ssh ds420`. Se puede repetir: lo que ya existe se deja igual.
set -euo pipefail

GALERIA=/volume1/Galeria
REMOTE_DIR=/volume1/docker/iridiscencia-web
RDOCKER=/var/packages/ContainerManager/target/usr/bin/docker
HERE=$(cd "$(dirname "$0")" && pwd)

CARPETAS=(
  "00 Portada" "01 Bodas" "02 Pre-boda" "03 XV Años" "04 Maternidad" "05 Graduaciones"
  "06 Cumpleaños" "07 Niños y bebés" "08 Eventos corporativos" "09 Retratos" "10 Familia" "_Sin publicar"
)

remote() { ssh -o LogLevel=ERROR ds420 "$@"; }

echo "1/3 Carpetas en $GALERIA..."
for c in "${CARPETAS[@]}"; do
  remote "mkdir -p '$GALERIA/$c'"
done
# CRLF para que se lea bien en el Bloc de notas de Windows.
sed 's/$/\r/' "$HERE/gallery-sync/LEEME.txt" | remote "cat > '$GALERIA/LEEME - Cómo publicar fotos.txt'"

echo "2/3 Enviando gallery-sync y docker-compose al NAS..."
remote "cp $REMOTE_DIR/docker-compose.yml $REMOTE_DIR/docker-compose.yml.bak-$(date +%Y-%m-%d)"
tar -C "$HERE" -c gallery-sync/Dockerfile gallery-sync/entrypoint.sh gallery-sync/regenerate-manifest.sh \
  | remote "tar -x -C $REMOTE_DIR"
remote "cat > $REMOTE_DIR/docker-compose.yml" < "$HERE/docker-compose.web.yml"

echo "3/3 Reconstruyendo gallery-sync..."
remote "cd $REMOTE_DIR && $RDOCKER compose up -d --build gallery-sync" 2>&1 | tail -2
sleep 10
remote "$RDOCKER logs --tail 3 iridiscencia-gallery-sync"
