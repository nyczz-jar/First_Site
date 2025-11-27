<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../php/conectaDB.php';

// Obtém JSON do corpo da requisição
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validação de entrada
if (!$data || !isset($data['modelo']) || !isset($data['ano']) || !isset($data['preco']) || !isset($data['potencia'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
    exit;
}

$modelo = trim($data['modelo']);
$ano = intval($data['ano']);
$preco = floatval($data['preco']);
$potencia = intval($data['potencia']);

// Validações
if (empty($modelo) || strlen($modelo) > 100) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Modelo inválido']);
    exit;
}

if ($ano < 1900 || $ano > 2100) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Ano inválido']);
    exit;
}

if ($preco < 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Preço não pode ser negativo']);
    exit;
}

if ($potencia < 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Potência não pode ser negativa']);
    exit;
}

try {
    $query = "INSERT INTO cars (modelo, ano, preco, potencia) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($query);

    if (!$stmt) {
        throw new Exception('Erro ao preparar statement: ' . $conn->error);
    }

    $stmt->bind_param('sidi', $modelo, $ano, $preco, $potencia);

    if ($stmt->execute()) {
        $insertedId = $conn->insert_id;
        echo json_encode(['success' => true, 'message' => 'Carro criado com sucesso', 'id' => $insertedId]);
    } else {
        throw new Exception('Erro ao inserir carro: ' . $stmt->error);
    }

    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
?>
