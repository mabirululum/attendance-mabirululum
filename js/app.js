// ================= ENTRY POINT UTAMA =================
import { loadDatabaseData } from './api.js';
import { updateClock, handleRouting, switchAdminTab, openModalGuru, closeModalGuru, closeEditModal, closeModalQR, openModalUser, closeModalUser, closeModalIzin } from './utils.js';
import { handleLogin, handleLogout } from './auth.js';
import { renderGuru, saveGuru, openEditGuru, updateGuru, deleteAllGuru, deleteGuru, showQRCode, cetakIDCard, cetakSemuaIDCard, downloadTemplateGuru, handleImportGuru } from './teachers.js';
import { renderUsers, saveUser, deleteUser } from './users.js';
import { openModalIzin, saveIzin, renderAbsensi, changePage, exportToExcel } from './attendance.js';

// MENANGKAP EVENT UNTUK RE-RENDER ATAU RE-FETCH SECARA AMAN (Memecah Circular Dependency)
window.addEventListener('refreshData', loadDatabaseData);
window.addEventListener('renderData', () => {
    renderGuru();
    renderAbsensi();
    renderUsers();
});

// MENGEKSPOS FUNGSI KE GLOBAL WINDOW AGAR BISA DIPANGGIL DARI ATTRIBUTE ONCLICK DI HTML
window.switchAdminTab = switchAdminTab;

// Ekpos Modal & Utilitas
window.openModalGuru = openModalGuru;
window.closeModalGuru = closeModalGuru;
window.closeEditModal = closeEditModal;
window.closeModalQR = closeModalQR;
window.openModalUser = openModalUser;
window.closeModalUser = closeModalUser;
window.openModalIzin = openModalIzin;
window.closeModalIzin = closeModalIzin;

// Ekpos Aksi Guru (Termasuk fitur baru edit & hapus semua)
window.saveGuru = saveGuru;
window.openEditGuru = openEditGuru;
window.updateGuru = updateGuru;
window.deleteAllGuru = deleteAllGuru;
window.deleteGuru = deleteGuru;
window.showQRCode = showQRCode;
window.cetakIDCard = cetakIDCard;
window.cetakSemuaIDCard = cetakSemuaIDCard;
window.downloadTemplateGuru = downloadTemplateGuru;
window.handleImportGuru = handleImportGuru;

// Ekpos Aksi User
window.saveUser = saveUser;
window.deleteUser = deleteUser;

// Ekpos Aksi Absensi & Laporan
window.saveIzin = saveIzin;
window.changePage = changePage;
window.exportToExcel = exportToExcel;
window.renderAbsensi = renderAbsensi;

// Ekpos Autentikasi
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;

// INISIALISASI SAAT HALAMAN DIMUAT
document.addEventListener("DOMContentLoaded", () => {
    // 1. Setup Tanggal Filter Bulanan Default
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    document.getElementById('filterMonth').value = `${year}-${month}`;
    document.getElementById('currentYear').innerText = year;

    // 2. Setup Jam Realtime
    updateClock();
    setInterval(updateClock, 1000);

    // 3. Setup Routing & Listeners
    handleRouting();
    window.addEventListener('hashchange', handleRouting);
    
    document.body.addEventListener('click', () => {
        if(!window.audioInitiated) window.audioInitiated = true;
    }, { once: true });

    // 4. Tarik data MySQL saat pertama kali halaman dimuat!
    loadDatabaseData();
});