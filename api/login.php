<?php
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->username) || !isset($data->password)) {
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap"]);
    exit;
}

$username = $data->username;
$password = md5($data->password); // Validasi dengan MD5

$stmt = $conn->prepare("SELECT nama, role FROM users WHERE username = :usr AND password = :pwd LIMIT 1");
$stmt->execute([':usr' => $username, ':pwd' => $password]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo json_encode(["status" => "success", "data" => $user]);
} else {
    echo json_encode(["status" => "error", "message" => "Username atau password salah!"]);
}
?>