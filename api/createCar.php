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
    // Primeiro, tentamos reutilizar o menor ID inteiro positivo livre (preencher lacunas)
    $result = $conn->query("SELECT id FROM cars ORDER BY id ASC");
    if ($result === false) {
        throw new Exception('Erro ao buscar IDs existentes: ' . $conn->error);
    }

    $expected = 1;
    $idToUse = null;
    if ($result->num_rows === 0) {
        $idToUse = 1;
    } else {
        while ($row = $result->fetch_assoc()) {
            $current = intval($row['id']);
            if ($current > $expected) {
                // encontramos uma lacuna
                $idToUse = $expected;
                break;
            }
            $expected = $current + 1;
        }
        if ($idToUse === null) {
            // nenhuma lacuna encontrada, o próximo disponível é $expected (último + 1)
            $idToUse = $expected;
        }
    }

    // Tenta inserir explicitamente com o ID calculado. Se houver concorrência
    // e o ID já tiver sido tomado, caímos no fallback que usa auto-increment.
    $insertQuery = "INSERT INTO cars (id, modelo, ano, preco, potencia) VALUES (?, ?, ?, ?, ?);";
    $stmt = $conn->prepare($insertQuery);
    if ($stmt) {
        $stmt->bind_param('isidi', $idToUse, $modelo, $ano, $preco, $potencia);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Carro criado com sucesso', 'id' => $idToUse]);
            $stmt->close();
            $result->free();
            $conn->close();
            exit;
        }
        // se falhou por duplicate key ou outra razão, tentaremos o insert sem id
        $stmt->close();
    }

    // Fallback - inserir sem ID (auto-increment)
    $query = "INSERT INTO cars (modelo, ano, preco, potencia) VALUES (?, ?, ?, ?)";
    $stmt2 = $conn->prepare($query);
    if (!$stmt2) {
        throw new Exception('Erro ao preparar statement fallback: ' . $conn->error);
    }
    $stmt2->bind_param('sidi', $modelo, $ano, $preco, $potencia);
    if ($stmt2->execute()) {
        $insertedId = $conn->insert_id;
        echo json_encode(['success' => true, 'message' => 'Carro criado com sucesso', 'id' => $insertedId]);
    } else {
        throw new Exception('Erro ao inserir carro (fallback): ' . $stmt2->error);
    }

    $stmt2->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
?>
