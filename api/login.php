<?php
/**
 * Endpoint de Login - API
 * 
 * Este arquivo recebe as credenciais do frontend (login.html) e valida contra o banco de dados.
 * 
 * Método: POST
 * Content-Type: application/json
 * 
 * Request:
 * {
 *   "email": "usuario@exemplo.com ou (11) 91234-5678",
 *   "password": "senha123"
 * }
 * 
 * Response (sucesso):
 * {
 *   "success": true,
 *   "token": "token_abc123",
 *   "userId": 1,
 *   "email": "usuario@exemplo.com"
 * }
 * 
 * Response (erro):
 * {
 *   "success": false,
 *   "message": "Email/Telefone ou senha incorretos"
 * }
 */

/**
 * Método personalizado para verificar uma senha.
 *
 * @param string $password: A senha fornecida pelo usuário.
 * @param string $inputPassword: Senha armazenada no banco de dados.
 * @return bool Retorna TRUE se a senha coincidir, FALSE caso contrário.
 */
function verifyPasswordCustom($password, $inputPassword) {
    return $password === $inputPassword;
}


// Define o header como JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Tratamento CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Verifica se é um request POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método não permitido']);
        exit();
    }

    // Recebe e decodifica JSON do request
    $inputData = json_decode(file_get_contents('php://input'), true);

    if (!$inputData) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
        exit();
    }

    $email = isset($inputData['email']) ? trim($inputData['email']) : '';
    $password = isset($inputData['password']) ? $inputData['password'] : '';

    // Validação básica
    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email e senha são obrigatórios']);
        exit();
    }

    // ===================================================================
    // AQUI: Adicione sua lógica de autenticação com banco de dados
    // ===================================================================
    
    try {
        $pdo = new PDO('mysql:host=localhost;dbname=koenigsegg', 'root', '');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Normaliza email ou telefone
        $emailOrPhone = $email;
        if (preg_match('/^\d+$/', str_replace(['(', ')', ' ', '-'], '', $email))) {
            // Se for telefone, remove formatação
            $emailOrPhone = preg_replace('/\D/', '', $email);
        }

        // Busca usuário por email ou telefone
        $stmt = $pdo->prepare("SELECT id, email, senha FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !verifyPasswordCustom($password, $user['senha'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Email ou senha incorretos']);
            exit();
        }

        // Sucesso: gera token (use JWT ou uma string segura)
        $token = bin2hex(random_bytes(32));

        // Opcionalmente, armazena token no banco para validações futuras
        // $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        // $stmt->execute([$user['id']]);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'token' => $token,
            'userId' => $user['id'],
            'email' => $user['email']
        ]);
        exit();

    } catch (PDOException $e) {
        error_log('Database Error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro ao conectar ao banco de dados']);
        exit();
    }


    // ===================================================================
    // EXEMPLO DE VALIDAÇÃO LOCAL (para testes - remova em produção)
    // ===================================================================
    
    // Lista de usuários válidos (substitua por consulta ao BD)
    $validUsers = [
        ['email' => 'admin@koenigsegg.com', 'phone' => '', 'password' => password_hash('admin123', PASSWORD_BCRYPT)],
        ['email' => 'user@koenigsegg.com', 'phone' => '11912345678', 'password' => password_hash('senha123', PASSWORD_BCRYPT)]
    ];

    // Normaliza entrada (remove caracteres especiais do telefone se fornecido)
    $emailOrPhone = preg_replace('/\D/', '', $email);

    $foundUser = null;
    foreach ($validUsers as $user) {
        if ($user['email'] === $email || $user['phone'] === $emailOrPhone) {
            $foundUser = $user;
            break;
        }
    }

    if (!$foundUser || !password_verify($password, $foundUser['password'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Email/Telefone ou senha incorretos']);
        exit();
    }

    // Sucesso: retorna token
    $token = bin2hex(random_bytes(32));
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'token' => $token,
        'userId' => 1,
        'email' => $foundUser['email']
    ]);
    exit();

} catch (Exception $e) {
    error_log('Erro inesperado: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro interno do servidor']);
    exit();
}
?>
