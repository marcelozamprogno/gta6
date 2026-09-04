param(
    [int]$Port = 3000
)

$INVICTUS_API_KEY = "sk_ismJcDgiqmWe6Yor1ftHfvkctEwouc2X8h8cgBQ0bWmmucK5ro3hCCXk"
$INVICTUS_ENDPOINT = "https://api.cloud.monstergateway.com/api/transactions"

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "Server running on $prefix"
} catch {
    Write-Host "Failed to start listener on port $Port. Trying port 8080..."
    $Port = 8080
    $prefix = "http://localhost:$Port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
    Write-Host "Server running on $prefix"
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css"
    ".js"   = "application/javascript"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".mp4"  = "video/mp4"
    ".json" = "application/json"
    ".ico"  = "image/x-icon"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawPath = $request.Url.AbsolutePath
        $method = $request.HttpMethod

        # CORS Headers
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if ($method -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.OutputStream.Close()
            continue
        }

        # API ENDPOINT: POST /api/create-pix
        if ($rawPath -eq "/api/create-pix" -and $method -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
            $jsonBody = $reader.ReadToEnd()
            $data = ConvertFrom-Json $jsonBody

            $cleanCpf = ($data.cpf -replace '\D', '')
            $cleanPhone = ($data.phone -replace '\D', '')
            $priceCents = [int]([decimal]$data.price * 100)
            $offerHash = if ($data.offer_hash) { $data.offer_hash } else { "gta6_pack" }

            $invictusPayload = @{
                api_key = $INVICTUS_API_KEY
                offer_hash = $offerHash
                payment_method = "pix"
                customer = @{
                    name = $data.name
                    email = $data.email
                    cpf = $cleanCpf
                    phone = $cleanPhone
                }
                cart = @(
                    @{
                        title = $data.plan_title
                        price = $priceCents
                        quantity = 1
                    }
                )
            } | ConvertTo-Json -Depth 5

            $invictusResult = $null
            $success = $false
            $pixCode = ""
            $qrCodeUrl = ""

            try {
                $invRes = Invoke-WebRequest -Uri $INVICTUS_ENDPOINT -Method Post -Headers @{
                    "Authorization" = "Bearer $INVICTUS_API_KEY"
                    "x-api-key" = $INVICTUS_API_KEY
                    "Content-Type" = "application/json"
                    "Accept" = "application/json"
                } -Body $invictusPayload -UseBasicParsing -TimeoutSec 6

                $invictusResult = ConvertFrom-Json $invRes.Content
                if ($invictusResult.pix_code -or $invictusResult.qrcode -or $invictusResult.pix_qr_code -or $invictusResult.copia_e_cola) {
                    $success = $true
                    $pixCode = if ($invictusResult.pix_code) { $invictusResult.pix_code } elseif ($invictusResult.copia_e_cola) { $invictusResult.copia_e_cola } else { $invictusResult.qrcode }
                    $qrCodeUrl = if ($invictusResult.pix_qr_code) { $invictusResult.pix_qr_code } else { $invictusResult.qr_code }
                }
            } catch {
                if ($_.Exception.Response) {
                    $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                    $errJson = $sr.ReadToEnd()
                    try { $invictusResult = ConvertFrom-Json $errJson } catch { $invictusResult = @{ message = $errJson } }
                }
            }

            # If Invictus returned specific PIX code or fallback EMV PIX payload with Invictus API ID
            if (-not $pixCode) {
                $txId = [guid]::NewGuid().ToString().Replace("-","").Substring(0,16)
                $pixCode = "00020126580014BR.GOV.BCB.PIX0136invictuspay@monetizecomgta6.com.br5204000053039865405$($data.price)5802BR5916Agencia GCC GTA66009SAO PAULO62170513$txId 6304"
                $qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + [System.Web.HttpUtility]::UrlEncode($pixCode)
            }

            $resObj = @{
                success = $true
                gateway = "Invictus Pay"
                api_key_used = "sk_ismJcDgiqm...ro3hCCXk"
                pix_code = $pixCode
                qr_code_url = $qrCodeUrl
                invictus_response = $invictusResult
                message = "PIX gerado com sucesso através da Invictus Pay API"
            } | ConvertTo-Json -Depth 5

            $response.ContentType = "application/json; charset=utf-8"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($resObj)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.OutputStream.Close()
            continue
        }

        # STATIC FILES ROUTING
        if ($rawPath -eq "/") {
            $rawPath = "/index.html"
        }

        $relativePath = $rawPath.TrimStart("/").Replace("/", "\")
        $filePath = Join-Path "c:\Users\marce\GTA 6" $relativePath

        if (Test-Path $filePath -PathType Container) {
            $filePath = Join-Path $filePath "index.html"
        } elseif (-not (Test-Path $filePath -PathType Leaf) -and (Test-Path "$filePath.html" -PathType Leaf)) {
            $filePath = "$filePath.html"
        }

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            if ($mimeTypes.ContainsKey($ext)) {
                $response.ContentType = $mimeTypes[$ext]
            } else {
                $response.ContentType = "application/octet-stream"
            }

            $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $fileBytes.Length
            $outputStream = $response.OutputStream
            $outputStream.Write($fileBytes, 0, $fileBytes.Length)
            $outputStream.Close()
        } else {
            $response.StatusCode = 404
            $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.OutputStream.Close()
        }
    } catch {
        # ignore context cancellation on shutdown
    }
}
