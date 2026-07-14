#!/bin/bash
set -e
umask 022
GALERIA_DIR="/galeria"
THUMBS="_thumbs"
MANIFEST="$GALERIA_DIR/manifest.json"

tmp=$(mktemp)
echo '{"categorias":[]}' > "$tmp"

for cat_dir in "$GALERIA_DIR"/*/; do
  [ -d "$cat_dir" ] || continue
  cat_id=$(basename "$cat_dir")
  [ "$cat_id" = "$THUMBS" ] && continue
  case "$cat_id" in
    @*|.*|"#recycle") continue ;;
  esac

  mkdir -p "$cat_dir$THUMBS"

  fotos_json="[]"
  shopt -s nullglob nocaseglob
  for foto in "$cat_dir"*.jpg "$cat_dir"*.jpeg "$cat_dir"*.png; do
    [ -f "$foto" ] || continue
    fname=$(basename "$foto")
    thumb="$cat_dir$THUMBS/$fname"
    if [ ! -f "$thumb" ] || [ "$foto" -nt "$thumb" ]; then
      convert "$foto" -auto-orient -resize 600x600 -quality 82 "$thumb"
    fi
    fotos_json=$(echo "$fotos_json" | jq --arg src "/galeria/$cat_id/$fname" --arg thumb "/galeria/$cat_id/$THUMBS/$fname" '. += [{"src":$src,"thumb":$thumb}]')
  done
  shopt -u nullglob nocaseglob

  nombre=$(echo "$cat_id" | tr '-' ' ' | awk '{for(i=1;i<=NF;i++){$i=toupper(substr($i,1,1)) substr($i,2)}}1')

  jq --arg id "$cat_id" --arg nombre "$nombre" --argjson fotos "$fotos_json" \
    '.categorias += [{"id":$id,"nombre":$nombre,"fotos":$fotos}]' "$tmp" > "$tmp.new" && mv "$tmp.new" "$tmp"
done

mv "$tmp" "$MANIFEST"
chmod 644 "$MANIFEST"
find "$GALERIA_DIR" -mindepth 1 -maxdepth 1 -type d ! -name "@eaDir" ! -name "#recycle" | while read -r d; do
  [ -d "$d/$THUMBS" ] && chmod 755 "$d/$THUMBS" && find "$d/$THUMBS" -type f -exec chmod 644 {} \;
done
echo "manifest.json regenerado: $(date)"
