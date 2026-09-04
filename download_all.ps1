$contentMd = "C:\Users\marce\.gemini\antigravity-ide\brain\49dacd4d-e26e-4ba5-9ade-97d9b7cadf31\.system_generated\steps\4\content.md"
$lines = Get-Content $contentMd -Encoding UTF8
$html = $lines[8..($lines.Length - 1)]
$html | Set-Content "c:\Users\marce\GTA 6\index.html" -Encoding UTF8

New-Item -ItemType Directory -Force -Path "c:\Users\marce\GTA 6\assets" | Out-Null
New-Item -ItemType Directory -Force -Path "c:\Users\marce\GTA 6\feedbacks" | Out-Null

$baseUrl = "https://monetizecomgta6.com.br"
$assets = @(
    "assets/favicon.png",
    "assets/hero-video2.mp4",
    "assets/buyer1.jpg",
    "assets/buyer2.jpg",
    "assets/buyer3.jpg",
    "assets/buyer4.jpg",
    "assets/buyer5.jpg",
    "assets/sample-cortes.mp4",
    "assets/sample-cortes.jpg",
    "assets/sample-curiosidades.mp4",
    "assets/sample-curiosidades.jpg",
    "assets/sample-teorias.mp4",
    "assets/sample-teorias.jpg",
    "assets/sample-memes.mp4",
    "assets/sample-memes.jpg",
    "assets/sample-vazamentos.jpg",
    "assets/sample-reacts.jpg",
    "assets/mockup.png",
    "assets/bonus-50k-br.png",
    "assets/bonus-calendario.png",
    "assets/bonus-guia.png",
    "assets/bonus-planilha.png",
    "assets/bonus-manual.svg",
    "assets/bonus-50k-eua.png",
    "assets/bonus-20k-cursos.png",
    "feedbacks/fb1.jpg",
    "feedbacks/fb2.jpg",
    "feedbacks/fb3.jpg",
    "feedbacks/fb4.jpg",
    "feedbacks/fb5.jpg",
    "feedbacks/fb6.jpg",
    "feedbacks/fb7.jpg",
    "assets/comunidade.png",
    "assets/selo-garantia.png",
    "assets/gcc.jpg",
    "assets/downsell-oferta.jpg"
)

foreach ($asset in $assets) {
    $url = "$baseUrl/$asset"
    $outPath = "c:\Users\marce\GTA 6\$asset"
    Write-Host "Downloading $url -> $outPath"
    curl.exe -s -L -o $outPath $url
}

Write-Host "All assets downloaded successfully."
