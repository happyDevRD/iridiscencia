#!/bin/bash
# Regenera /galeria/manifest.json a partir de las carpetas de /volume1/Galeria.
#
# Convenciones (explicadas al staff en LEEME.txt):
#   "01 Bodas/"        categoría; el número solo ordena y no se muestra ("Bodas")
#   "00 Portada/"      fotos del inicio de la web (no es categoría)
#   "_Sin publicar/"   todo lo que empieza por "_" o "@" se ignora
# Por cada foto se generan dos copias reducidas: _thumbs/ (cuadrícula) y _web/ (visor y portada).
set -e
umask 022
GALERIA_DIR="/galeria"
MANIFEST="$GALERIA_DIR/manifest.json"
PORTADA_ID="portada"

# El NAS tiene poca RAM: un solo hilo de libvips basta y gasta menos.
export VIPS_CONCURRENCY=1

# "01 XV Años" -> "XV Años"
display_name() { echo "$1" | sed -E 's/^[0-9]+[ ._-]*//'; }

# "XV Años" -> "xv-anos"
slug() {
  echo "$1" | sed -e 's/[ÁÀÄáàä]/a/g; s/[ÉÈËéèë]/e/g; s/[ÍÌÏíìï]/i/g; s/[ÓÒÖóòö]/o/g; s/[ÚÙÜúùü]/u/g; s/[Ññ]/n/g' \
    | tr 'A-Z' 'a-z' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g'
}

# resize <origen> <destino> <lado máximo> <calidad>
resize() {
  vipsthumbnail "$1" --size "$3x$3>" -o "$2[Q=$4,strip,interlace,optimize_coding]"
}

# Imprime un array JSON con las fotos de una carpeta.
fotos_de() {
  local dir="$1" dir_name fotos_json="[]" foto fname base thumb web wh
  dir_name=$(basename "$dir")
  mkdir -p "$dir/_thumbs" "$dir/_web"

  shopt -s nullglob nocaseglob
  for foto in "$dir"/*.jpg "$dir"/*.jpeg "$dir"/*.png; do
    [ -f "$foto" ] || continue
    fname=$(basename "$foto")
    case "$fname" in _*|.*) continue ;; esac
    base="${fname%.*}.jpg"
    thumb="$dir/_thumbs/$base"
    web="$dir/_web/$base"
    if [ ! -f "$thumb" ] || [ "$foto" -nt "$thumb" ]; then resize "$foto" "$thumb" 1100 76 || continue; fi
    if [ ! -f "$web" ] || [ "$foto" -nt "$web" ]; then resize "$foto" "$web" 2400 82 || continue; fi
    wh="$(vipsheader -f width "$thumb" 2>/dev/null || echo 0) $(vipsheader -f height "$thumb" 2>/dev/null || echo 0)"
    fotos_json=$(jq -c --arg dir "$dir_name" --arg base "$base" --arg w "${wh% *}" --arg h "${wh#* }" \
      '. += [{
        "src":   ("/galeria/" + ($dir|@uri) + "/_web/"    + ($base|@uri)),
        "thumb": ("/galeria/" + ($dir|@uri) + "/_thumbs/" + ($base|@uri)),
        "w": ($w|tonumber), "h": ($h|tonumber)
      }]' <<<"$fotos_json")
  done
  shopt -u nocaseglob

  # Quita copias reducidas de fotos que ya no existen.
  local copia nombre ext existe
  for copia in "$dir"/_thumbs/* "$dir"/_web/*; do
    nombre=$(basename "${copia%.*}")
    existe=""
    for ext in jpg jpeg png JPG JPEG PNG Jpg Jpeg Png; do
      [ -f "$dir/$nombre.$ext" ] && existe=1 && break
    done
    [ -n "$existe" ] || rm -f "$copia"
  done
  shopt -u nullglob

  echo "$fotos_json"
}

tmp=$(mktemp)
echo '{"portada":[],"categorias":[]}' > "$tmp"

for dir in "$GALERIA_DIR"/*/; do
  dir="${dir%/}"
  dir_name=$(basename "$dir")
  case "$dir_name" in @*|_*|.*|"#recycle") continue ;; esac

  nombre=$(display_name "$dir_name")
  id=$(slug "$nombre")
  [ -n "$id" ] || continue
  fotos=$(fotos_de "$dir")

  if [ "$id" = "$PORTADA_ID" ]; then
    jq --argjson fotos "$fotos" '.portada = $fotos' "$tmp" > "$tmp.new"
  else
    jq --arg id "$id" --arg nombre "$nombre" --argjson fotos "$fotos" \
      '.categorias += [{"id":$id,"nombre":$nombre,"fotos":$fotos}]' "$tmp" > "$tmp.new"
  fi
  mv "$tmp.new" "$tmp"
done

mv "$tmp" "$MANIFEST"
chmod 644 "$MANIFEST"
find "$GALERIA_DIR" -mindepth 2 -maxdepth 2 -type d \( -name _thumbs -o -name _web \) -exec chmod 755 {} +
find "$GALERIA_DIR" -mindepth 3 -maxdepth 3 -type f \( -path '*/_thumbs/*' -o -path '*/_web/*' \) -exec chmod 644 {} +
echo "manifest.json regenerado: $(date)"
