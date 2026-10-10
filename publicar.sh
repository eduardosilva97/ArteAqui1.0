#!/usr/bin/env bash
# Gera a versão de produção e publica a pasta www/ no branch gh-pages (GitHub Pages).
# Uso: npm run publicar            (publica no remoto "origin")
#      npm run publicar -- <url>   (publica em outro repositório)
set -e
cd "$(dirname "$0")"

DESTINO="${1:-$(git remote get-url origin)}"

npm run build -- --prod

cd www
rm -rf .git
touch .nojekyll
git init -q
git checkout -q -b gh-pages
git add -A
git -c user.name="$(git -C .. config user.name)" -c user.email="$(git -C .. config user.email)" \
  commit -q -m "Publica o site ($(git -C .. rev-parse --short HEAD))"
git push -q -f "$DESTINO" gh-pages
rm -rf .git
echo "Publicado no branch gh-pages de $DESTINO"
