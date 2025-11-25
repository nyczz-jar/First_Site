<?php
/**
 * Endpoint de Validação de Token - API
 * 
 * Verifica se um token de autenticação é válido.
 * Útil para validações de sessão no servidor.
 * 
 * Método: POST
 * Content-Type: application/json
 * 
 * Request:
 * {
 *   "token": "token_abc123"
 * }
 * 
 * Response (válido):
 * {
 *   "valid": true,
 *   "userId": 1,
 *   "email": "usuario@exemplo.com"
 * }
 * 
 * Response (inválido):
 * {
 *   "valid": false,
 *   "message": "Token inválido ou expirado"
 * }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['valid' => false, 'message' => 'Método não permitido']);
        exit();
    }

    $inputData = json_decode(file_get_contents('php://input'), true);

    if (!$inputData || empty($inputData['token'])) {
        http_response_code(400);
        echo json_encode(['valid' => false, 'message' => 'Token não fornecido']);
        exit();
    }

    $token = $inputData['token'];

    // ===================================================================
    // AQUI: Adicione sua lógica de validação de token
    // ===================================================================
    
    /*
    // Exemplo com banco de dados:
    try {
        $pdo = new PDO('mysql:host=localhost;dbname=koenigsegg', 'root', '');
        $stmt = $pdo->prepare("SELECT id, email FROM users WHERE token = ? AND token_expires > NOW()");
        $stmt->execute([$token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            http_response_code(401);
            echo json_encode(['valid' => false, 'message' => 'Token inválido ou expirado']);
            exit();
        }

        http_response_code(200);
        echo json_encode([
            'valid' => true,
            'userId' => $user['id'],
            'email' => $user['email']
        ]);
        exit();

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['valid' => false, 'message' => 'Erro ao validar token']);
        exit();
    }
    */

    // Validação simples (para testes)
    if (strpos($token, 'token_') === 0) {
        http_response_code(200);
        echo json_encode([
            'valid' => true,
            'userId' => 1,
            'email' => 'admin@koenigsegg.com'
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['valid' => false, 'message' => 'Token inválido']);
    }
    exit();

} catch (Exception $e) {
    error_log('Erro na validação: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['valid' => false, 'message' => 'Erro interno do servidor']);
    exit();
}
?>
