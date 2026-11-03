# Draws the app icons into icons/. Run: powershell -ExecutionPolicy Bypass -File .claude/icons.ps1
# Every icon keeps its artwork inside the central 80% so it also works as a maskable icon.
Add-Type -AssemblyName System.Drawing
$out = Join-Path (Split-Path $PSScriptRoot) 'icons'
New-Item -ItemType Directory -Force $out | Out-Null
function C($hex, $a = 255) { $c = [System.Drawing.ColorTranslator]::FromHtml($hex); [System.Drawing.Color]::FromArgb($a, $c) }

function Draw([int]$size, [string]$name) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'; $g.TextRenderingHint = 'AntiAliasGridFit'
  $s = $size / 512.0
  $g.Clear((C '#100C24'))
  # Faint checkerboard, 8x8 across the full tile.
  $sq = $size / 8.0
  $light = New-Object System.Drawing.SolidBrush (C '#1B1640')
  for ($y = 0; $y -lt 8; $y++) { for ($x = 0; $x -lt 8; $x++) {
    if (($x + $y) % 2 -eq 0) { $g.FillRectangle($light, [float]($x * $sq), [float]($y * $sq), [float]$sq, [float]$sq) } } }
  # Glow behind the king.
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddEllipse([float](96 * $s), [float](96 * $s), [float](320 * $s), [float](320 * $s))
  $glow = New-Object System.Drawing.Drawing2D.PathGradientBrush $path
  $glow.CenterColor = (C '#5BE1FF' 110); $glow.SurroundColors = @((C '#5BE1FF' 0))
  $g.FillPath($glow, $path)
  # Incoming bullets: red streaks with bright heads, aimed at the king.
  foreach ($b in @(@(70, 120, 175, 205), @(440, 150, 345, 215), @(420, 400, 335, 340))) {
    $pen = New-Object System.Drawing.Drawing2D.LinearGradientBrush ([System.Drawing.PointF]::new($b[0] * $s, $b[1] * $s)), ([System.Drawing.PointF]::new($b[2] * $s, $b[3] * $s)), (C '#FF5C7A' 0), (C '#FF5C7A' 255)
    $p = New-Object System.Drawing.Pen $pen, ([float](14 * $s))
    $pen.WrapMode = 'TileFlipXY'; $p.StartCap = 'Flat'; $p.EndCap = 'Round'
    $g.DrawLine($p, [float]($b[0] * $s), [float]($b[1] * $s), [float]($b[2] * $s), [float]($b[3] * $s))
    $r = 13 * $s
    $g.FillEllipse((New-Object System.Drawing.SolidBrush (C '#FFD0DA')), [float]($b[2] * $s - $r), [float]($b[3] * $s - $r), [float](2 * $r), [float](2 * $r))
  }
  # The king.
  $font = New-Object System.Drawing.Font 'Segoe UI Symbol', ([float](285 * $s)), ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = 'Center'; $fmt.LineAlignment = 'Center'
  $rect = New-Object System.Drawing.RectangleF 0, ([float](14 * $s)), $size, $size
  $g.DrawString([string][char]0x265A, $font, (New-Object System.Drawing.SolidBrush (C '#0A2A3A')), (New-Object System.Drawing.RectangleF ([float](6 * $s)), ([float](22 * $s)), $size, $size), $fmt)
  $g.DrawString([string][char]0x265A, $font, (New-Object System.Drawing.SolidBrush (C '#5BE1FF')), $rect, $fmt)
  $bmp.Save((Join-Path $out $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}
Draw 512 'icon-512.png'
Draw 192 'icon-192.png'
Draw 180 'apple-touch-icon.png'
Draw 32 'favicon-32.png'
Write-Output "Icons written to $out"

