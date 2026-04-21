<?php
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->qr_code)) {
    echo json_encode(["status" => "error", "message" => "QR Code tidak ditemukan!"]);
    exit;
}

// FIXED: Menggunakan trim() untuk membersihkan karakter newline/spasi tak terlihat dari kamera scanner
$qr_code = trim($data->qr_code);
$tanggal_hari_ini = date("Y-m-d");
$jam_sekarang = date("H:i:s");
$hari_ini_indonesia = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][date("w")];

try {
    // Cek Guru berdasarkan QR
    $stmt = $conn->prepare("SELECT * FROM teachers WHERE qr_code = :qr LIMIT 1");
    $stmt->execute([':qr' => $qr_code]);
    $guru = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$guru) {
        echo json_encode(["status" => "error", "message" => "QR Code tidak terdaftar!"]);
        exit;
    }

    $teacher_id = $guru['id'];
    $jadwal_guru = json_decode($guru['jadwal'], true);

    // Cek record absensi hari ini
    $stmt = $conn->prepare("SELECT * FROM attendance WHERE teacher_id = :tid AND tanggal = :tgl LIMIT 1");
    $stmt->execute([':tid' => $teacher_id, ':tgl' => $tanggal_hari_ini]);
    $absensi = $stmt->fetch(PDO::FETCH_ASSOC);

    // LOGIKA ABSEN MASUK
    if (!$absensi || $absensi['jam_masuk'] === '-') {
        $status_kehadiran = 'Hadir';
        
        // Cek keterlambatan (Opsional)
        if (isset($jadwal_guru[$hari_ini_indonesia])) {
            $jam_masuk_jadwal = $jadwal_guru[$hari_ini_indonesia]['masuk'];
            if ($jam_sekarang > $jam_masuk_jadwal) {
                $status_kehadiran = "Terlambat Masuk";
            }
        }

        if ($absensi) {
            // Timpa data jika sebelumnya di-set manual (misal: Alpha/Sakit diubah jadi Hadir)
            $update = $conn->prepare("UPDATE attendance SET jam_masuk = :jam, status = :st WHERE id = :id");
            $update->execute([':jam' => $jam_sekarang, ':st' => $status_kehadiran, ':id' => $absensi['id']]);
        } else {
            // Buat record baru
            $insert = $conn->prepare("INSERT INTO attendance (teacher_id, tanggal, jam_masuk, status) VALUES (:tid, :tgl, :jam, :st)");
            $insert->execute([':tid' => $teacher_id, ':tgl' => $tanggal_hari_ini, ':jam' => $jam_sekarang, ':st' => $status_kehadiran]);
        }
        
        echo json_encode(["status" => "success", "type" => "masuk", "guru" => $guru['nama'], "waktu" => $jam_sekarang]);
    } 
    // LOGIKA ABSEN PULANG
    else if ($absensi['jam_pulang'] === null || $absensi['jam_pulang'] === '-') {
        // Cek Cooldown (Misal: minimal 60 menit setelah absen masuk)
        $waktu_masuk = strtotime($absensi['jam_masuk']);
        $waktu_sekarang = strtotime($jam_sekarang);
        $selisih_menit = round(abs($waktu_sekarang - $waktu_masuk) / 60);

        if ($selisih_menit < 60) {
            echo json_encode(["status" => "warning", "message" => "Anda baru saja absen masuk. Silakan tunggu sebelum absen pulang."]);
            exit;
        }

        $status_pulang = ' | Tuntas';
        if (isset($jadwal_guru[$hari_ini_indonesia])) {
            $jam_pulang_jadwal = $jadwal_guru[$hari_ini_indonesia]['pulang'];
            if ($jam_sekarang < $jam_pulang_jadwal) {
                $status_pulang = " | Pulang Lebih Awal";
            }
        }

        $status_baru = $absensi['status'] . $status_pulang;

        $update = $conn->prepare("UPDATE attendance SET jam_pulang = :jam, status = :st WHERE id = :id");
        $update->execute([':jam' => $jam_sekarang, ':st' => $status_baru, ':id' => $absensi['id']]);
        
        echo json_encode(["status" => "success", "type" => "pulang", "guru" => $guru['nama'], "waktu" => $jam_sekarang]);
    } 
    // SUDAH SELESAI
    else {
        echo json_encode(["status" => "info", "message" => "Anda sudah menyelesaikan absensi hari ini."]);
    }
} catch(Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>