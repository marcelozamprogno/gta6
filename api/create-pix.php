<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(["success" => false, "error" => "Invalid JSON payload."]);
    exit();
}

$apiKey = "sk_DObI6KFYde8jqeLX6GMOXkhQkZZu0PAdCUMlJ6dP3lkwDRpO1CDDcSHo";
$endpoint = "https://api.invictuspayv2.com.br/api/v1/transactions";

// Construir payload para Invictus
$amountCents = intval(floatval($data['price']) * 100);
$cpf = preg_replace('/\D/', '', $data['cpf'] ?? '');
$phone = preg_replace('/\D/', '', $data['phone'] ?? '');

$invictusPayload = [
    "amount" => $amountCents,
    "paymentMethod" => "pix",
    "customer" => [
        "name" => !empty($data['name']) ? $data['name'] : "Cliente",
        "email" => !empty($data['email']) ? $data['email'] : "cliente@email.com",
        "document" => !empty($cpf) ? $cpf : "00000000000",
        "phone" => !empty($phone) ? $phone : ""
    ],
    "items" => [
        [
            "offer_hash" => $data['offer_hash'] ?? 'off_01m1n4txnfxqj31zwsnvgksz6j',
            "quantity" => 1,
            "amount" => $amountCents
        ]
    ],
    "pix" => [
        "expirationInSeconds" => 1800
    ]
];

$ch = curl_init($endpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($invictusPayload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "X-Api-Key: $apiKey",
    "Accept: application/json",
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$result = json_decode($response, true);

if ($httpCode >= 200 && $httpCode < 300 && isset($result['success']) && $result['success']) {
    $pixCode = "";
    if (isset($result['data']['pix']['qr_code'])) {
        $pixCode = $result['data']['pix']['qr_code'];
    } elseif (isset($result['data']['pix']['copiaECola'])) {
        $pixCode = $result['data']['pix']['copiaECola'];
    }
    
    echo json_encode([
        "success" => true,
        "pix_code" => $pixCode,
        "raw" => $result
    ]);
} else {
    $errorMsg = "Erro desconhecido";
    if (isset($result['error'])) $errorMsg = $result['error'];
    elseif (isset($result['message'])) $errorMsg = $result['message'];
    
    echo json_encode([
        "success" => false,
        "error" => $errorMsg,
        "raw" => $result
    ]);
}
?>
