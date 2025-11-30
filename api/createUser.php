<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../php/conectaDB.php';

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'JSON inválido']);
    exit;
}

$nome = isset($data['nome']) ? trim($data['nome']) : '';
$email = isset($data['email']) ? trim($data['email']) : '';
$password = isset($data['password']) ? $data['password'] : '';

if (empty($nome) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Nome, email e senha são obrigatórios']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email inválido']);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Senha deve ter ao menos 6 caracteres']);
    exit;
}

try {
    // Checa se email já existe
    $stmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
    if (!$stmt) throw new Exception('Erro ao preparar query: ' . $conn->error);
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Email já cadastrado']);
        $stmt->close();
        exit;
    }
    $stmt->close();

    // Hash da senha
    $hash = password_hash($password, PASSWORD_BCRYPT);

    // Primeiro, tentamos reutilizar o menor ID inteiro positivo livre (preencher lacunas)
    $result = $conn->query("SELECT id FROM users ORDER BY id ASC");
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
            // nenhuma lacuna encontrada, o próximo disponível é $expected
            $idToUse = $expected;
        }
    }

    // Tente inserir explicitamente com o ID calculado. Se houver concorrência,
    // cai no fallback que usa auto-increment.
    $insertQuery = "INSERT INTO users (id, nome, email, senha) VALUES (?, ?, ?, ?)";
    $ins = $conn->prepare($insertQuery);
    if ($ins) {
        $ins->bind_param('isss', $idToUse, $nome, $email, $hash);
        if ($ins->execute()) {
            echo json_encode(['success' => true, 'message' => 'Usuário criado', 'id' => $idToUse]);
            $ins->close();
            $result->free();
            $conn->close();
            exit;
        }
        $ins->close();
    }

    // Fallback: inserir sem ID (auto-increment)
    $ins2 = $conn->prepare('INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)');
    if (!$ins2) throw new Exception('Erro ao preparar insert fallback: ' . $conn->error);
    $ins2->bind_param('sss', $nome, $email, $hash);
    if ($ins2->execute()) {
        $newId = $conn->insert_id;
        echo json_encode(['success' => true, 'message' => 'Usuário criado', 'id' => $newId]);
    } else {
        throw new Exception('Erro ao inserir usuário (fallback): ' . $ins2->error);
    }
    $ins2->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
?>
