<?php
require_once 'config.php';

// Menarik seluruh data absensi dari tabel MySQL
$stmt = $conn->prepare("SELECT * FROM attendance ORDER BY tanggal DESC, jam_masuk DESC");
$stmt->execute();
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(["status" => "success", "data" => $data]);
?>