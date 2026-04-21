// ================= SCANNER QR =================
import { API_BASE_URL, state, triggerRefresh } from './state.js';
import { speakVoice } from './utils.js';
import { loginViaQRCode } from './auth.js';

export function startScanner() {
    if (state.html5QrcodeScanner) return; 
    state.html5QrcodeScanner = new Html5QrcodeScanner("reader", { 
        fps: 10, qrbox: {width: 250, height: 250}, aspectRatio: 1.0, supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    }, false);
    state.html5QrcodeScanner.render(onScanSuccess, onScanFailure);
}

export function stopScanner() {
    if (state.html5QrcodeScanner) {
        state.html5QrcodeScanner.clear().catch(e => console.error(e));
        state.html5QrcodeScanner = null;
    }
}

function onScanSuccess(decodedText) {
    if (state.isProcessingScan) return;
    state.isProcessingScan = true; 
    processScanLocal(decodedText);
}

function onScanFailure(error) { /* Dibiarkan kosong */ }

function processScanLocal(qrText) {
    // 1. Cek Apakah ini QR Login Admin/Piket
    const matchedUser = state.mockUsers.find(u => u.qr_code === qrText);
    if (matchedUser) {
        const roleLabel = matchedUser.role === 'admin' ? 'Administrator' : 'Guru Piket';
        loginViaQRCode(matchedUser.role, matchedUser.nama + ' (' + roleLabel + ')');
        state.isProcessingScan = false;
        return;
    }

    // 2. Kirim request ke Database PHP
    fetch(`${API_BASE_URL}/scan.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_code: qrText })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            const pesanSuara = data.type === 'masuk' ? 'Selamat bekerja' : 'Hati-hati di jalan';
            speakVoice(`Berhasil, ${data.guru}. ${pesanSuara}.`);
            Swal.fire({ icon: 'success', title: 'Berhasil!', html: `<b>${data.guru}</b><br>Absen ${data.type} pada ${data.waktu}`, timer: 3000, showConfirmButton: false });
            triggerRefresh(); // Segarkan Data Tabel setelah scan
        } 
        else if (data.status === 'warning') {
            speakVoice(`Maaf, tunggu beberapa saat untuk absen pulang.`);
            Swal.fire({ icon: 'warning', title: 'Terlalu Cepat!', html: data.message, timer: 3500, showConfirmButton: false });
        } 
        else if (data.status === 'info') {
            speakVoice(`Anda sudah menyelesaikan absen hari ini.`);
            Swal.fire({ icon: 'info', title: 'Selesai', html: data.message, timer: 3000, showConfirmButton: false });
        } 
        else {
            speakVoice("Maaf, QR Code tidak terdaftar.");
            Swal.fire({ icon: 'error', title: 'Ditolak', text: data.message, timer: 3000, showConfirmButton: false });
        }
    })
    .catch(error => {
        console.error("Database Error:", error);
        Swal.fire({ icon: 'error', title: 'Koneksi Gagal', text: 'Tidak dapat terhubung ke database MYSQL.' });
    })
    .finally(() => {
        setTimeout(() => { state.isProcessingScan = false; }, 3500);
    });
}