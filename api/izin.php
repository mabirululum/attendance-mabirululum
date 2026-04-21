<?php
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->teacher_id)) {
    $tid = $data->teacher_id;
    $start = new DateTime($data->start_date);
    $end = new DateTime($data->end_date);
    $end = $end->modify('+1 day'); // Tambah 1 hari agar looping mencakup hari terakhir
    
    $interval = DateInterval::createFromDateString('1 day');
    $period = new DatePeriod($start, $interval, $end);
    
    $status = $data->status;
    if (!empty($data->keterangan)) {
        $status .= " (" . $data->keterangan . ")";
    }

    foreach ($period as $dt) {
        $tanggal = $dt->format("Y-m-d");
        
        // Cek apakah di tanggal tersebut guru sudah ada record (misal alpha)
        $stmt = $conn->prepare("SELECT id FROM attendance WHERE teacher_id = :tid AND tanggal = :tgl");
        $stmt->execute([':tid' => $tid, ':tgl' => $tanggal]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            // Update jika record sudah ada
            $upd = $conn->prepare("UPDATE attendance SET jam_masuk='-', jam_pulang='-', status=:st WHERE id=:id");
            $upd->execute([':st' => $status, ':id' => $row['id']]);
        } else {
            // Insert record baru
            $ins = $conn->prepare("INSERT INTO attendance (teacher_id, tanggal, jam_masuk, jam_pulang, status) VALUES (:tid, :tgl, '-', '-', :st)");
            $ins->execute([':tid' => $tid, ':tgl' => $tanggal, ':st' => $status]);
        }
    }
    echo json_encode(["status" => "success", "message" => "Status {$data->status} berhasil diinput ke database."]);
} else {
    echo json_encode(["status" => "error", "message" => "Data guru tidak valid."]);
}
?>