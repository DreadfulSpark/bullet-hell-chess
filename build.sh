#!/usr/bin/env bash
# Builds index.html (a full HTML document for GitHub Pages) from bullet-hell-chess.html,
# which is written as a page body without the <html>/<head> wrapper.
set -euo pipefail
cd "$(dirname "$0")"
{
  printf '<!doctype html>\n<html lang="en">\n<head>\n'
  printf '<meta charset="utf-8">\n'
  printf '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
  printf '<meta name="description" content="Real-time chess roguelike: no turns, every piece has a cooldown, and both armies move at once.">\n'
  cat bullet-hell-chess.html
  printf '\n</html>\n'
} > index.html
echo "Built index.html"
