// ================= INTEGRASI API =================
import { API_BASE_URL, state, triggerRender } from './state.js';

export async function loadDatabaseData() {
    try {
        // 1. Ambil Data Guru
        const resGuru = await fetch(`${API_BASE_URL}/teachers.php`);
        const dataGuru = await resGuru.json();
        if (dataGuru.status === 'success') {
            state.mockTeachers = dataGuru.data;
        }

        // 2. Ambil Data Absensi
        const resAbsen = await fetch(`${API_BASE_URL}/report.php`);
        const dataAbsen = await resAbsen.json();
        if (dataAbsen.status === 'success') {
            state.mockAttendance = dataAbsen.data;
        }

        // 3. Ambil Data Pengguna
        const resUser = await fetch(`${API_BASE_URL}/users.php`);
        const dataUser = await resUser.json();
        if (dataUser.status === 'success') {
            state.mockUsers = dataUser.data;
        }

        // Picu event untuk menyegarkan tampilan tabel di seluruh modul
        triggerRender();

    } catch(error) {
        console.warn("Belum bisa terkoneksi ke Database MySQL. Pastikan XAMPP Apache & MySQL menyala.", error);
    }
}