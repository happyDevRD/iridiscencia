#!/bin/bash
# Despliega el sitio en el NAS del estudio con versión fija (commit de git).
#
#   nas/deploy-web.sh [commit]     por defecto HEAD; construye exactamente ese commit
#   nas/deploy-web.sh rollback     vuelve a la versión anterior registrada
#
# Construye la imagen aquí (house-pc) desde `git archive`, así no entran cambios sin commit,
# y la envía al NAS por SSH. Requiere VPN conectada y `ssh ds420`.
# VITE_WEB3FORMS_KEY se toma del entorno o de .env.local si existe.
# Si el sitio no responde tras el cambio, vuelve solo a la versión anterior.
set -euo pipefail

REMOTE_DIR=/volume1/docker/iridiscencia-web
RDOCKER=/var/packages/ContainerManager/target/usr/bin/docker
IMAGE=iridiscencia-web
REPO=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)

die() { echo "ERROR: $*" >&2; exit 1; }
remote() { ssh -o LogLevel=ERROR ds420 "$@"; }

current_tag() { remote "grep -E '^WEB_TAG=' $REMOTE_DIR/.env 2>/dev/null | cut -d= -f2" || true; }

set_tag() {
  remote "cd $REMOTE_DIR && touch .env && { grep -vE '^WEB_TAG=' .env; echo 'WEB_TAG=$1'; } > .env.tmp && mv .env.tmp .env && chmod 600 .env"
}

switch_to() {
  set_tag "$1"
  remote "cd $REMOTE_DIR && $RDOCKER compose up -d web" 2>&1 | grep -vE '^\s*$' | tail -2
}

# El sitio, la galería y el catálogo deben responder desde dentro del contenedor.
check() {
  for _ in $(seq 1 12); do
    if remote "$RDOCKER exec iridiscencia-web sh -c 'wget -qO /dev/null http://localhost/ && wget -qO /dev/null http://localhost/galeria/manifest.json && wget -qO /dev/null http://localhost/catalogo/catalogo.json'" 2>/dev/null; then
      return 0
    fi
    sleep 5
  done
  return 1
}

if [ "${1:-}" = "rollback" ]; then
  previous=$(remote "cat $REMOTE_DIR/.previous-web" 2>/dev/null || true)
  [ -n "$previous" ] || die "no hay versión anterior registrada"
  echo "Volviendo el sitio a $previous..."
  switch_to "$previous"
  check && echo "OK: sitio en $previous" || die "el sitio no responde tras el rollback"
  exit 0
fi

sha=$(git -C "$REPO" rev-parse --short=12 "${1:-HEAD}^{commit}") || die "commit no válido: ${1:-HEAD}"
key=${VITE_WEB3FORMS_KEY:-$(grep -E '^VITE_WEB3FORMS_KEY=' "$REPO/.env.local" 2>/dev/null | cut -d= -f2- || true)}
[ -n "$key" ] || echo "Aviso: sin VITE_WEB3FORMS_KEY, el formulario de contacto no enviará correos."

echo "1/4 Construyendo $IMAGE:$sha..."
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
git -C "$REPO" archive "$sha" | tar -x -C "$tmp"
docker build -q -t "$IMAGE:$sha" --build-arg VITE_WEB3FORMS_KEY="$key" "$tmp" >/dev/null

echo "2/4 Enviando la imagen al NAS..."
docker save "$IMAGE:$sha" | gzip | remote "gunzip | $RDOCKER load" >/dev/null

previous=$(current_tag)
if [ -z "$previous" ]; then
  # Primera vez: la imagen vieja de GHCR queda con un tag local para poder volver.
  previous="pre-$(date +%Y%m%d%H%M)"
  remote "$RDOCKER tag ghcr.io/happydevrd/iridiscencia-web:latest $IMAGE:$previous"
fi
[ "$previous" = "$sha" ] || remote "echo $previous > $REMOTE_DIR/.previous-web"

echo "3/4 Desplegando $sha (anterior: $previous)..."
switch_to "$sha"

echo "4/4 Comprobando sitio, galería y catálogo..."
if check; then
  echo "OK: sitio en $sha"
else
  echo "FALLO: el sitio no responde; volviendo a $previous" >&2
  switch_to "$previous"
  check || echo "ATENCIÓN: tampoco responde en $previous; revisar a mano" >&2
  exit 1
fi
