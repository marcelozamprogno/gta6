param(
    [int]$Port = 3000
)

$INVICTUS_X_API_KEY = "sk_ismJcDgiqmWe6Yor1ftHfvkctEwouc2X8h8cgBQ0bWmmucK5ro3hCCXk"
$INVICTUS_V2_ENDPOINT = "https://api.invictuspayv2.com.br/api/v1/transactions"
$DEFAULT_OFFER_HASH = "off_01m1n4txnfxqj31zwsnvgksz6j"

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
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Api-Key")

        if ($method -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.OutputStream.Close()
            continue
        }

        # API ENDPOINT: POST /api/create-pix (InvictusPay v2 API)
        if ($rawPath -eq "/api/create-pix" -and $method -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
            $jsonBody = $reader.ReadToEnd()
            $data = ConvertFrom-Json $jsonBody

            $apiKeyToUse = if ($data.x_api_key) { $data.x_api_key } else { $INVICTUS_X_API_KEY }
            $cleanCpf = ($data.cpf -replace '\D', '')
            $cleanPhone = ($data.phone -replace '\D', '')
            $amountCents = [int]([decimal]$data.price * 100)
            $offerHash = if ($data.offer_hash -and $data.offer_hash -ne "off_gta6_pack" -and $data.offer_hash -ne "off_exemplo") { $data.offer_hash } else { $DEFAULT_OFFER_HASH }

            $invictusPayload = @{
                amount = $amountCents
                paymentMethod = "pix"
                customer = @{
                    name = $data.name
                    email = $data.email
                    document = $cleanCpf
                    phone = $cleanPhone
                }
                items = @(
                    @{
                        offer_hash = $offerHash
                        quantity = 1
                        amount = $amountCents
                    }
                )
                pix = @{
                    expirationInSeconds = 1800
                }
            } | ConvertTo-Json -Depth 5

            $invictusResult = $null
            $success = $false
            $pixCode = ""
            $qrCodeUrl = ""
            $errorMessage = ""
            $transactionId = ""

            try {
                $invRes = Invoke-WebRequest -Uri $INVICTUS_V2_ENDPOINT -Method Post -Headers @{
                    "X-Api-Key" = $apiKeyToUse
                    "accept" = "application/json"
                    "content-type" = "application/json"
                } -Body $invictusPayload -UseBasicParsing -TimeoutSec 8

                $invictusResult = ConvertFrom-Json $invRes.Content

                if ($invictusResult.data) {
                    if ($invictusResult.data.id) { $transactionId = $invictusResult.data.id }
                    if ($invictusResult.data.pix) {
                        if ($invictusResult.data.pix.qr_code) { $pixCode = $invictusResult.data.pix.qr_code }
                        elseif ($invictusResult.data.pix.copiaECola) { $pixCode = $invictusResult.data.pix.copiaECola }
                    }
                }

                if (-not $pixCode -and $invictusResult.pix) {
                    if ($invictusResult.pix.qr_code) { $pixCode = $invictusResult.pix.qr_code }
                    elseif ($invictusResult.pix.copiaECola) { $pixCode = $invictusResult.pix.copiaECola }
                    elseif ($invictusResult.pix.qrcode) { $pixCode = $invictusResult.pix.qrcode }
                }

                if ($pixCode) {
                    $success = $true
                }
            } catch {
                if ($_.Exception.Response) {
                    $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                    $errJson = $sr.ReadToEnd()
                    try { 
                        $invictusResult = ConvertFrom-Json $errJson 
                        if ($invictusResult.message) { $errorMessage = $invictusResult.message }
                        elseif ($invictusResult.error) { $errorMessage = $invictusResult.error }
                    } catch { 
                        $errorMessage = $errJson 
                    }
                } else {
                    $errorMessage = $_.Exception.Message
                }
            }

            if (-not $qrCodeUrl -and $pixCode) {
                $qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + [System.Web.HttpUtility]::UrlEncode($pixCode)
            }

            $resObj = @{
                success = $success
                gateway = "InvictusPay v2"
                x_api_key_used = $apiKeyToUse
                endpoint = $INVICTUS_V2_ENDPOINT
                offer_hash_used = $offerHash
                transaction_id = $transactionId
                pix_code = $pixCode
                qr_code_url = $qrCodeUrl
                error = $errorMessage
                invictus_response = $invictusResult
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
