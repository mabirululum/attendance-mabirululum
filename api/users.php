<?php
require_once 'config.php';
$method = $_SERVER['REQUEST_METHOD'];

// GET: Mengambil daftar pengguna (Admin & Piket)
if ($method === 'GET') {
    $stmt = $conn->prepare("SELECT id, nama, role, qr_code FROM users ORDER BY role ASC, nama ASC");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["status" => "success", "data" => $users]);
} 
// POST: Menambah pengguna baru
else if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $nama = $data->nama;
    $role = $data->role;
    $qr_code = $data->qr_code;

    try {
        $stmt = $conn->prepare("INSERT INTO users (nama, role, qr_code) VALUES (:nama, :role, :qr)");
        $stmt->execute([':nama' => $nama, ':role' => $role, ':qr' => $qr_code]);
        echo json_encode(["status" => "success", "message" => "Pengguna berhasil ditambahkan"]);
    } catch(PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Gagal menambahkan pengguna. " . $e->getMessage()]);
    }
}
// DELETE: Menghapus pengguna
else if ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;

    $stmt = $conn->prepare("DELETE FROM users WHERE id = :id");
    $stmt->execute([':id' => $id]);
    echo json_encode(["status" => "success", "message" => "Pengguna berhasil dihapus"]);
}
?>