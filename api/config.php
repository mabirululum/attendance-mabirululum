<?php
// Mengizinkan akses dari Frontend (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// PENANGANAN PREFLIGHT REQUEST (Wajib ada agar tidak error di local XAMPP)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = "localhost";
$db_name = "db_absensi_qr";
$username = "root";
$password = ""; // Sesuaikan password XAMPP Anda

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    echo json_encode(["status" => "error", "message" => "Koneksi database gagal: " . $exception->getMessage()]);
    exit;
}
?>