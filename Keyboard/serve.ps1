$root = "d:\Projects\keyboard-2\Keyboard"
$port = 5555
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Server started at http://localhost:$port/"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath
        if ($path -eq "/") { $path = "/public/index.html" }
        $fullPath = Join-Path $root $path.TrimStart('/')

        if (Test-Path $fullPath -PathType Leaf) {
            $content = [IO.File]::ReadAllBytes($fullPath)
            $response.StatusCode = 200
            $ext = [IO.Path]::GetExtension($fullPath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html" }
                ".js" { "application/javascript" }
                ".mjs" { "application/javascript" }
                ".css" { "text/css" }
                ".png" { "image/png" }
                ".jpg" { "image/jpeg" }
                ".svg" { "image/svg+xml" }
                ".json" { "application/json" }
                ".mp3" { "audio/mpeg" }
                default { "application/octet-stream" }
            }
            $response.ContentType = $contentType
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Cross-Origin-Resource-Policy", "cross-origin")
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
