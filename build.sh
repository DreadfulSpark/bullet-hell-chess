#!/usr/bin/env bash
# Builds index.html (a full HTML document for GitHub Pages) from bullet-hell-chess.html,
# which is written as a page body without the <html>/<head> wrapper.
# The extra head tags and the service worker make the site installable as a phone app.
set -euo pipefail
cd "$(dirname "$0")"
{
  printf '<!doctype html>\n<html lang="en">\n<head>\n'
  printf '<meta charset="utf-8">\n'
  printf '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
  printf '<meta name="description" content="Real-time chess roguelike: no turns, every piece has a cooldown, and both armies move at once.">\n'
  printf '<meta name="theme-color" content="#100C24">\n'
  printf '<meta name="mobile-web-app-capable" content="yes">\n'
  printf '<meta name="apple-mobile-web-app-capable" content="yes">\n'
  printf '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n'
  printf '<meta name="apple-mobile-web-app-title" content="BH Chess">\n'
  printf '<link rel="manifest" href="manifest.webmanifest">\n'
  printf '<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">\n'
  printf '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n'
  printf "<script>if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js'))</script>\n"
  cat bullet-hell-chess.html
  printf '\n</html>\n'
} > index.html
echo "Built index.html"
