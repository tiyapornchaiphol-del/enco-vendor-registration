# EnCo Vendor Registration - PowerShell HTTP Server
$port = 8000
$directory = Get-Location

# Create HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host ""
    Write-Host "========================================="
    Write-Host "EnCo Vendor Registration - Local Server"
    Write-Host "========================================="
    Write-Host ""
    Write-Host "Server running at: http://localhost:$port"
    Write-Host "Directory: $directory"
    Write-Host ""
    Write-Host "Press CTRL+C to stop the server"
    Write-Host ""

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $localPath = $request.Url.LocalPath
        if ($localPath -eq '/') { $localPath = '/index.html' }

        $filePath = Join-Path $directory $localPath
        $filePath = [System.IO.Path]::GetFullPath($filePath)

        # Security check - prevent directory traversal
        if (-not $filePath.StartsWith([System.IO.Path]::GetFullPath($directory))) {
            $response.StatusCode = 403
            $response.Close()
            continue
        }

        # Serve file if exists
        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath)

            # MIME types
            $mimeTypes = @{
                '.html' = 'text/html'
                '.htm' = 'text/html'
                '.css' = 'text/css'
                '.js' = 'application/javascript'
                '.jsx' = 'application/javascript'
                '.json' = 'application/json'
                '.png' = 'image/png'
                '.jpg' = 'image/jpeg'
                '.jpeg' = 'image/jpeg'
                '.gif' = 'image/gif'
                '.svg' = 'image/svg+xml'
                '.ico' = 'image/x-icon'
                '.woff' = 'font/woff'
                '.woff2' = 'font/woff2'
                '.ttf' = 'font/ttf'
                '.xlsx' = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }

            $contentType = $mimeTypes[$ext]
            if (-not $contentType) { $contentType = 'application/octet-stream' }

            $response.ContentType = $contentType
            $buffer = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)

            Write-Host "$($request.HttpMethod) $($request.Url.LocalPath) - 200"
        }
        else {
            # Try index.html for directories
            $indexPath = Join-Path $filePath 'index.html'
            if (Test-Path $indexPath -PathType Leaf) {
                $response.ContentType = 'text/html'
                $buffer = [System.IO.File]::ReadAllBytes($indexPath)
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                Write-Host "$($request.HttpMethod) $($request.Url.LocalPath) - 200 (index.html)"
            }
            else {
                $response.StatusCode = 404
                Write-Host "$($request.HttpMethod) $($request.Url.LocalPath) - 404"
            }
        }

        $response.OutputStream.Close()
    }
}
finally {
    $listener.Stop()
    $listener.Close()
}
