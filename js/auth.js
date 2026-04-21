// ================= AUTENTIKASI =================
import { API_BASE_URL, state } from './state.js';
import { speakVoice } from './utils.js';

export function handleLogin(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="ph ph-spinner animate-spin text-lg inline-block align-middle"></i> Memproses...';
    btn.disabled = true;
    
    const payload = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    fetch(`${API_BASE_URL}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        if (data.status === 'success') {
            state.isLoggedIn = true;
            state.userRole = data.data.role; 
            Swal.fire({ icon: 'success', title: 'Login Berhasil!', timer: 1500, showConfirmButton: false })
            .then(() => { window.location.hash = '#admin'; });
        } else {
            Swal.fire({ icon: 'error', title: 'Akses Ditolak', text: data.message });
        }
    })
    .catch(error => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        Swal.fire({ icon: 'error', title: 'Koneksi Gagal', text: 'Tidak dapat terhubung ke database. Pastikan XAMPP menyala.' });
    });
}

export function loginViaQRCode(role, roleName) {
    state.isLoggedIn = true;
    state.userRole = role;
    speakVoice(`Akses diterima. Selamat datang, ${roleName}.`);
    Swal.fire({
        icon: 'success', title: 'Akses Diterima', text: `Login sebagai ${roleName}`, timer: 2000, showConfirmButton: false
    }).then(() => { window.location.hash = '#admin'; });
}

export function handleLogout() {
    state.isLoggedIn = false;
    state.userRole = null;
    document.getElementById('password').value = ''; 
    window.location.hash = ''; 
    Swal.fire({ icon: 'success', title: 'Logout Berhasil', timer: 1500, showConfirmButton: false });
}