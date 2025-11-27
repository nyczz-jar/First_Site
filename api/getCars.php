<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$bootOutput = '';
// Inclui conexão com o banco, capturando qualquer saída inesperada (warnings/HTML)
ob_start();
require_once __DIR__ . '/../php/conectaDB.php';
$bootOutput = ob_get_clean();

if (!empty(trim($bootOutput))) {
    // Se o include imprimiu HTML ou warnings, retorne como erro legível
    http_response_code(500);
    $msg = trim(strip_tags($bootOutput));
    if ($msg === '') $msg = 'Saída inesperada do servidor';
    echo json_encode(['success' => false, 'message' => $msg]);
    exit;
}

try {
    $query = "SELECT id, modelo, ano, preco, potencia FROM cars ORDER BY id ASC";
    $result = $conn->query($query);

    if ($result === false) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro na query: ' . $conn->error]);
        exit;
    }

    if ($result && $result->num_rows > 0) {
        $cars = [];
        while ($row = $result->fetch_assoc()) {
            $cars[] = $row;
        }
        echo json_encode(['success' => true, 'cars' => $cars]);
    } else {
        echo json_encode(['success' => true, 'cars' => []]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro ao buscar carros: ' . $e->getMessage()]);
}
?>
