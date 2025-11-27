<?php
// Configurações de conexão com o banco de dados
$servername = "localhost";
$username = "root";
$password = "";
$database = "koenigsegg"; // ajuste aqui se seu DB tiver nome diferente

// Cria conexão usando mysqli
$conn = new mysqli($servername, $username, $password, $database);

// Se ocorrer erro, retorna JSON e interrompe a execução (sem HTML adicional)
if ($conn->connect_error) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([ 'success' => false, 'message' => 'Erro de conexão: ' . $conn->connect_error ]);
    exit;
}

// Define charset para UTF-8
$conn->set_charset("utf8mb4");
?>
