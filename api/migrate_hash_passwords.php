<?php
/**
 * Script de migração: substitui senhas em texto plano por hashes BCRYPT na tabela `users`.
 * Uso seguro:
 * - Via CLI: php migrate_hash_passwords.php
 * - Via web (local): acessar ?confirm=1 por exemplo:
 *   http://localhost/Projeto Koenigsegg/api/migrate_hash_passwords.php?confirm=1
 * Após a execução remova ou proteja este arquivo.
 */

header('Content-Type: application/json; charset=utf-8');

// Permite execução via CLI ou via web com parâmetro confirm
if (php_sapi_name() !== 'cli') {
    if (!isset($_GET['confirm']) || $_GET['confirm'] !== '1') {
        echo json_encode([
            'success' => false,
            'message' => 'Este script deve ser executado via CLI ou com ?confirm=1 no browser (local). Remova-o após uso.'
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }
}

require_once __DIR__ . '/../php/conectaDB.php';

try {
    $res = $conn->query("SELECT id, nome, email, senha FROM users");
    if ($res === false) throw new Exception('Erro ao buscar usuários: ' . $conn->error);

    $updateStmt = $conn->prepare("UPDATE users SET senha = ? WHERE id = ?");
    if (!$updateStmt) throw new Exception('Erro ao preparar update: ' . $conn->error);

    $total = 0;
    $hashed = 0;
    $skipped = 0;
    $errors = [];

    while ($row = $res->fetch_assoc()) {
        $total++;
        $current = $row['senha'];

        // Detecta se já é um hash reconhecido por password_get_info
        $info = password_get_info($current);
        if ($info['algo'] !== 0) {
            // Já é um hash (bcrypt ou outro), pula
            $skipped++;
            continue;
        }

        // Caso seja texto simples, gera hash e atualiza
        $newHash = password_hash($current, PASSWORD_BCRYPT);
        if ($newHash === false) {
            $errors[] = "Falha ao gerar hash para user id {$row['id']}";
            continue;
        }

        $updateStmt->bind_param('si', $newHash, $row['id']);
        if ($updateStmt->execute()) {
            $hashed++;
        } else {
            $errors[] = "Erro ao atualizar id {$row['id']}: " . $updateStmt->error;
        }
    }

    $updateStmt->close();

    echo json_encode([
        'success' => true,
        'total_checked' => $total,
        'hashed' => $hashed,
        'skipped_already_hashed' => $skipped,
        'errors' => $errors
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();

?>
