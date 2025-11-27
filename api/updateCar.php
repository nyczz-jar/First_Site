<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../php/conectaDB.php';

// Obtém JSON do corpo da requisição
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validação de entrada
if (!$data || !isset($data['id']) || !isset($data['modelo']) || !isset($data['ano']) || !isset($data['preco']) || !isset($data['potencia'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
    exit;
}

$id = intval($data['id']);
$modelo = trim($data['modelo']);
$ano = intval($data['ano']);
$preco = floatval($data['preco']);
$potencia = intval($data['potencia']);

// Validações
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID inválido']);
    exit;
}

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
    // Verifica se o carro existe
    $checkQuery = "SELECT id FROM cars WHERE id = ?";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bind_param('i', $id);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Carro não encontrado']);
        $checkStmt->close();
        exit;
    }

    $checkStmt->close();

    // Atualiza o carro
    $query = "UPDATE cars SET modelo = ?, ano = ?, preco = ?, potencia = ? WHERE id = ?";
    $stmt = $conn->prepare($query);

    if (!$stmt) {
        throw new Exception('Erro ao preparar statement: ' . $conn->error);
    }

    $stmt->bind_param('sidii', $modelo, $ano, $preco, $potencia, $id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Carro atualizado com sucesso']);
    } else {
        throw new Exception('Erro ao atualizar carro: ' . $stmt->error);
    }

    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
?>
