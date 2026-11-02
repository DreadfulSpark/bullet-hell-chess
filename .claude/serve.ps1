param([string]$Page, [int]$Port = 5173)
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Output "Serving $Page on http://localhost:$Port/"
$bot = Join-Path $PSScriptRoot 'bot.js'
while ($l.IsListening) {
  $ctx = $l.GetContext()
  if ($ctx.Request.Url.AbsolutePath -eq '/bot.js') {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes([System.IO.File]::ReadAllText($bot))
    $ctx.Response.ContentType = "text/javascript; charset=utf-8"
  } else {
    $body = [System.IO.File]::ReadAllText((Resolve-Path $Page).Path)
    $html = "<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1,viewport-fit=cover'><script>if(location.search.includes('shim')){var P=null,T=performance.now();window.requestAnimationFrame=function(cb){P=cb;return 1};window.__step=function(n){for(var i=0;i<n;i++){T+=16;var c=P;P=null;if(c)c(T)}}}</script></head><body>" + $body + "<script>if(location.search.includes('bot'))document.write('<script src=/bot.js><\/script>')</script></body></html>"
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($html)
    $ctx.Response.ContentType = "text/html; charset=utf-8"
  }
  $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  $ctx.Response.Close()
}
