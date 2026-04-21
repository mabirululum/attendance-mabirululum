<?php
require_once 'config.php';
$method = $_SERVER['REQUEST_METHOD'];

// GET: Mengambil daftar semua guru
if ($method === 'GET') {
    $stmt = $conn->prepare("SELECT * FROM teachers ORDER BY nama ASC");
    $stmt->execute();
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Decode JSON jadwal kembali ke format array/object untuk frontend
    foreach($teachers as &$t) {
        $t['jadwal'] = json_decode($t['jadwal'], true);
    }
    
    echo json_encode(["status" => "success", "data" => $teachers]);
} 

// POST: Menambah guru baru
else if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    // Proteksi data kosong
    if (!$data || !isset($data->nip) || !isset($data->nama)) {
        echo json_encode(["status" => "error", "message" => "Data NIP dan Nama tidak boleh kosong!"]);
        exit;
    }
    
    $nip = $data->nip;
    $nama = $data->nama;
    // Jika tidak ada input jadwal, isi dengan JSON Object kosong '{}'
    $jadwal = isset($data->jadwal) ? json_encode($data->jadwal) : '{}'; 
    $qr_code = $data->qr_code;

    try {
        $stmt = $conn->prepare("INSERT INTO teachers (nip, nama, jadwal, qr_code) VALUES (:nip, :nama, :jadwal, :qr)");
        $stmt->execute([':nip' => $nip, ':nama' => $nama, ':jadwal' => $jadwal, ':qr' => $qr_code]);
        echo json_encode(["status" => "success", "message" => "Guru berhasil ditambahkan"]);
    } catch(PDOException $e) {
        // Tampilkan pesan error spesifik jika gagal (Misal: kolom tabel kurang, atau NIP dobel)
        echo json_encode(["status" => "error", "message" => "Gagal menyimpan ke database: " . $e->getMessage()]);
    }
}

// DELETE: Menghapus data guru
else if ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"));
    
    if(!isset($data->id)) {
        echo json_encode(["status" => "error", "message" => "ID tidak ditemukan"]);
        exit;
    }
    
    $id = $data->id;

    $stmt = $conn->prepare("DELETE FROM teachers WHERE id = :id");
    $stmt->execute([':id' => $id]);
    echo json_encode(["status" => "success", "message" => "Guru berhasil dihapus"]);
}
?>